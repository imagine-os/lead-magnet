import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { BookingRow, EventRow, PageRow, ProspectRow, StackGuessRow, TouchRow } from '../../data/schema/core';
import type { RecommendationRow } from '../../data/schema/admin';
import type { StackGuess } from '../../engine/types';
import { adaptFromEvents, composePage, type Recommendation } from '../../engine';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Icon } from '../../components/atom/Icon/Icon';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { buildTimeline, when } from './timeline';
import './admin.css';

const recKey = (r: Pick<Recommendation, 'kind' | 'to' | 'section'>) => `${r.kind}|${r.to ?? ''}|${r.section ?? ''}`;

/** A-02 - one prospect: every touch, event and booking in order, plus what the engine now recommends (recorded before applied, R-A03). */
export function ProspectTimelinePage() {
  const { id } = useParams();
  const { t, lang } = useI18n(); const { can, user } = useSession(); const data = useData(); const toast = useToast();
  const prospect = useRow<ProspectRow>('prospects', id);
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: id ?? '' } });
  const { rows: events } = useTable<EventRow>('events', { where: { prospect_id: id ?? '' } });
  const { rows: touches } = useTable<TouchRow>('touches', { where: { prospect_id: id ?? '' } });
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: { prospect_id: id ?? '' } });
  const { rows: guessRows } = useTable<StackGuessRow>('stack_guesses', { where: { prospect_id: id ?? '' } });
  const { rows: recorded } = useTable<RecommendationRow>('recommendations', { where: { prospect_id: id ?? '' } });
  const [busy, setBusy] = useState<string | null>(null);
  const page = pages.find((p) => p.status === 'live') ?? pages[0] ?? null;

  const items = useMemo(() => buildTimeline(events, touches, bookings), [events, touches, bookings]);
  const recs = useMemo(() => (page && prospect ? adaptFromEvents(page, events, prospect) : []), [page, events, prospect]);
  // `promote_variant` rows come from A-01's A/B readout and have no engine counterpart, so they never key a card here.
  const recordedByKey = useMemo(() => new Map(recorded.filter((r) => r.kind !== 'promote_variant').map((r) => [recKey({ kind: r.kind as Recommendation['kind'], to: r.to_archetype as Recommendation['to'], section: r.section ?? undefined }), r])), [recorded]);
  const guesses: StackGuess[] = useMemo(() => guessRows.map((g) => ({ tool: g.tool, category: g.category, monthly_cost: g.monthly_cost, confidence: g.confidence, status: g.status, replaced_by: g.replaced_by })), [guessRows]);

  /** R-A03: the recommendation exists as a row (status proposed) before anything is applied. */
  async function record(rec: Recommendation, note = ''): Promise<RecommendationRow | null> {
    if (!prospect || !page) return null;
    const existing = recordedByKey.get(recKey(rec));
    if (existing) return existing;
    return data.insert<RecommendationRow>('recommendations', { prospect_id: prospect.id, page_id: page.id, kind: rec.kind, to_archetype: rec.to ?? null, section: rec.section ?? null, reason: rec.reason, score: rec.score, status: 'proposed', decided_by: user.id, decided_at: null, note });
  }
  async function apply(rec: Recommendation) {
    if (!prospect || !page || rec.kind !== 'switch_archetype' || !rec.to) return;
    setBusy(recKey(rec));
    try {
      const row = await record(rec);
      const model = composePage(prospect, rec.to, { pageId: page.id, slug: page.slug, guesses, expiresAt: page.expires_at });
      await data.update<PageRow>('pages', page.id, { archetype: rec.to, model });
      if (row) await data.update<RecommendationRow>('recommendations', row.id, { status: 'applied', decided_at: new Date().toISOString(), decided_by: user.id });
      toast.push({ tone: 'success', title: t('admin.rec_applied', { to: t(`admin.arch_${rec.to}`) }), body: t('admin.rec_applied_body') });
    } catch (e) { toast.push({ tone: 'danger', title: t('admin.rec_failed'), body: String((e as Error).message ?? e) }); }
    setBusy(null);
  }
  async function dismiss(rec: Recommendation) {
    const row = await record(rec);
    if (row) await data.update<RecommendationRow>('recommendations', row.id, { status: 'dismissed', decided_at: new Date().toISOString(), decided_by: user.id });
    toast.push({ tone: 'info', title: t('admin.rec_dismissed') });
  }

  const api = useRef({ recs, apply, dismiss, record });
  api.current = { recs, apply, dismiss, record };
  useActions('A-02', {
    'admin.openFor': (p) => { const s = String(p?.surface ?? 'studio'); const to = s === 'demo' ? `/demo/${id}` : s === 'page' ? `/p/${page?.slug ?? ''}` : s === 'booking' ? `/book/${id}` : `/studio/prospects/${id}`; window.location.hash = `#${to}`; return to; },
    'admin.applyRecommendation': async (p) => { const n = Number(p?.n ?? 1) - 1; const rec = api.current.recs[n]; if (!rec) return `no recommendation ${String(p?.n)}`; if (rec.kind !== 'switch_archetype') return `recommendation ${n + 1} is ${rec.kind}: not wired yet (T12)`; await api.current.apply(rec); return rec.to ?? ''; },
    'admin.recordRecommendation': async (p) => { const rec = api.current.recs[Number(p?.n ?? 1) - 1]; if (!rec) return 'no such recommendation'; const row = await api.current.record(rec, String(p?.note ?? '')); return row?.id ?? 'already recorded'; },
    'admin.dismissRecommendation': async (p) => { const rec = api.current.recs[Number(p?.n ?? 1) - 1]; if (!rec) return 'no such recommendation'; await api.current.dismiss(rec); return 'dismissed'; },
  });

  if (!prospect) return <div className="container page"><EmptyState icon="users" title={t('admin.no_prospect')} body={t('admin.no_prospect_body')} action={<Link to="/admin"><Button variant="outline">{t('admin.back_funnel')}</Button></Link>} /></div>;

  return (<div className="container container-wide page stack ad">
    <div className="page-head"><div className="row"><Avatar name={`${prospect.first_name} ${prospect.last_name}`} color={prospect.style.palette.primary} size="lg" />
      <div><h1>{prospect.business_name}</h1><p className="xs muted">{prospect.first_name} {prospect.last_name} · {prospect.city}, {prospect.country} · {prospect.industry.replace(/_/g, ' ')} · <span lang={prospect.lang}>{prospect.lang.toUpperCase()}</span></p></div></div>
      <div className="row wrap"><Badge tone={prospect.warmth === 'hot' ? 'danger' : prospect.warmth === 'warm' ? 'warn' : 'info'} size="sm">{t(`admin.warm_${prospect.warmth}`)}</Badge>{page && <Badge status={page.status} size="sm">{page.archetype} · {t('admin.variant', { v: page.variant })}</Badge>}<Badge tone="primary" size="sm">A-02</Badge></div>
    </div>

    <Card padding="sm" className="ad-head-meta">
      <ProgressBar value={Math.round(prospect.confidence * 100)} label={t('admin.confidence')} tone={prospect.confidence >= 0.7 ? 'success' : prospect.confidence >= 0.4 ? 'primary' : 'warn'} />
      <div className="row wrap">
        <Link to={`/studio/prospects/${prospect.id}`}><Button size="sm" variant="outline" icon="edit">{t('admin.open_studio')}</Button></Link>
        <Link to={`/demo/${prospect.id}`}><Button size="sm" variant="ghost" icon="play">{t('admin.open_demo')}</Button></Link>
        {page && <Link to={`/p/${page.slug}`}><Button size="sm" variant="ghost" icon="globe">{t('admin.open_page')}</Button></Link>}
        <Link to={`/book/${prospect.id}`}><Button size="sm" variant="ghost" icon="calendar">{t('admin.open_booking')}</Button></Link>
      </div>
    </Card>

    <section className="stack-sm">
      <div className="page-head ad-sub-head"><h2>{t('admin.recs_h2')}</h2><span className="xs muted">{t('admin.recs_sub')}</span></div>
      {!page ? <EmptyState icon="sparkles" title={t('admin.recs_nopage')} body={t('admin.recs_nopage_body')} />
        : recs.length === 0 ? <EmptyState icon="check" title={t('admin.recs_none')} body={t('admin.recs_none_body')} />
        : (<div className="grid grid-auto">{recs.map((rec, i) => { const row = recordedByKey.get(recKey(rec)); const isSwitch = rec.kind === 'switch_archetype' && !!rec.to; return (
          <Card key={recKey(rec)} className="ad-rec stack-sm" tone={row?.status === 'applied' ? 'tint' : 'surface'}>
            <div className="row wrap"><Badge tone="primary" size="sm">{i + 1}</Badge><Badge size="sm">{t(`admin.rk_${rec.kind}`)}</Badge>{rec.to && <Badge tone="accent" size="sm">{t(`admin.arch_${rec.to}`)}</Badge>}{rec.section && <Badge size="sm">{rec.section}</Badge>}<span className="grow" /><span className="xs muted">{t('admin.score', { n: String(rec.score) })}</span></div>
            <p className="small">{rec.reason}</p>
            <p className="xs muted">{row ? t('admin.rec_recorded', { status: t(`admin.rs_${row.status}`), at: row.decided_at ? when(row.decided_at) : when(row.created_at) }) : t('admin.rec_unrecorded')}</p>
            <div className="row wrap">
              {isSwitch
                ? <Button size="sm" variant="primary" icon="check" loading={busy === recKey(rec)} disabled={!can('pages.publish') || row?.status === 'applied'} onClick={() => void apply(rec)}>{row?.status === 'applied' ? t('admin.rec_is_applied') : t('admin.rec_apply')}</Button>
                : <Placeholder will={t('admin.rec_will', { kind: t(`admin.rk_${rec.kind}`) })} by="T12 / T11"><Button size="sm" variant="secondary" icon="check">{t('admin.rec_apply')}</Button></Placeholder>}
              <Button size="sm" variant="outline" icon="spec" disabled={!!row} onClick={() => void record(rec)}>{row ? t('admin.rec_is_recorded') : t('admin.rec_record')}</Button>
              <Button size="sm" variant="ghost" icon="close" disabled={row?.status === 'dismissed'} onClick={() => void dismiss(rec)}>{t('admin.rec_dismiss')}</Button>
            </div>
          </Card>); })}</div>)}
    </section>

    <section className="stack-sm">
      <div className="page-head ad-sub-head"><h2>{t('admin.timeline_h2')}</h2><span className="xs muted">{t('admin.timeline_sub', { n: String(items.length) })}</span></div>
      {items.length === 0 ? <EmptyState icon="list" title={t('admin.no_events')} body={t('admin.no_events_body')} /> : (<ol className="ad-timeline">
        {items.map((it) => (<li key={it.id} className={`ad-tl ad-tl-${it.kind}`}>
          <span className="ad-tl-dot" aria-hidden><Icon name={it.icon} size={16} /></span>
          <span className="ad-tl-when xs muted">{when(it.at)}</span>
          <span className="ad-tl-body"><span className="ad-strong">{t(it.labelKey, it.labelVars)}</span>{it.summary && <span className="xs muted"> — {it.summary}</span>}</span>
          <span className="ad-tl-tags row wrap xs">{it.status && <Badge size="sm" status={it.status}>{it.status}</Badge>}{it.session && <code className="ad-code">{it.session}</code>}<Badge size="sm" tone="neutral">{t(`admin.tk_${it.kind}`)}</Badge></span>
        </li>))}
      </ol>)}
      <p className="xs muted" lang={lang}>{t('admin.timeline_note')}</p>
    </section>
  </div>);
}
