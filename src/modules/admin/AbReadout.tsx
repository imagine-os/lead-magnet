import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import type { EventRow, PageRow, ProspectRow } from '../../data/schema/core';
import type { RecommendationRow } from '../../data/schema/admin';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Select } from '../../components/atom/Select/Select';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { PairedBarChart } from '../../components/molecule/PairedBarChart/PairedBarChart';
import { useToast } from '../../components/molecule/Toast/Toast';
import { FUNNEL_STAGES, STAGE_KEY, pctLabel } from './funnel';
import { AB_METRIC, abReadout, abSlugs, ppDiff, rateWithCounts, type VariantReadout } from './ab';
import { when } from './timeline';

interface CompareRow { id: string; stage: string; aN: number; aRate: string; bN: number; bRate: string; diff: string }

/**
 * A-01 - the A/B readout. Two live `pages` rows on one slug (D-061) side by side: each side's archetype, live-since,
 * sessions and its own funnel, counted with the shared code (R-A01). No side is called ahead below the minimum sample
 * (R-A04), and when B is ahead the only thing that happens automatically is a `recommendations` row, never a change
 * to a live page (R-A03 / D-044).
 */
export function AbReadout({ pages, events, prospectById, slug, onSlug }: { pages: PageRow[]; events: EventRow[]; prospectById: Record<string, ProspectRow>; slug: string; onSlug: (slug: string) => void }) {
  const { t } = useI18n(); const { can, user } = useSession(); const data = useData(); const toast = useToast();
  const { rows: recorded } = useTable<RecommendationRow>('recommendations');

  const splits = useMemo(() => abSlugs(pages), [pages]);
  const active = splits.find((s) => s.slug === slug) ?? splits[0] ?? null;
  const readout = useMemo(() => (active ? abReadout(active.slug, pages, events) : null), [active, pages, events]);
  const bSide = readout?.sides.find((s) => s.variant === 'B') ?? null;
  const onFile = useMemo(() => recorded.find((r) => r.kind === 'promote_variant' && bSide && r.page_id === bSide.page.id) ?? null, [recorded, bSide]);
  const promotable = readout?.verdict === 'leader' && readout.leader === 'B' && !!bSide;

  /** R-A03 / D-044: the recommendation becomes a row (proposed) - promoting B is a separate, human act. */
  const inFlight = useRef<Promise<string> | null>(null);
  const recordWinner = (): Promise<string> => { if (inFlight.current) return inFlight.current; const p = recordWinnerOnce().finally(() => { inFlight.current = null; }); inFlight.current = p; return p; };
  async function recordWinnerOnce(): Promise<string> {
    if (!readout || !promotable || !bSide) return 'no recommendation to record';
    if (onFile) return onFile.id;
    const a = readout.sides.find((s) => s.variant === 'A');
    const reason = `A/B on ${readout.slug}: variant B converts ${rateWithCounts(bSide.metric.to, bSide.metric.from)} view → demo against ${a ? rateWithCounts(a.metric.to, a.metric.from) : '—'} for A (+${Math.round(readout.lift * 100)} % relative, minimum sample ${readout.minSessions} met). Promote variant B.`;
    const row = await data.insert<RecommendationRow>('recommendations', {
      prospect_id: bSide.page.prospect_id, page_id: bSide.page.id, kind: 'promote_variant', to_archetype: bSide.page.archetype, section: null,
      reason, score: Math.round(readout.lift * 100) / 10, status: 'proposed', decided_by: user.id, decided_at: null, note: `slug ${readout.slug}`,
    });
    toast.push({ tone: 'success', title: t('admin.ab_rec_saved'), body: t('admin.ab_rec_saved_body') });
    return row.id;
  }

  const api = useRef({ recordWinner, onSlug, splits });
  api.current = { recordWinner, onSlug, splits };
  useActions('A-01', {
    'admin.compareVariants': (p) => {
      const want = String(p?.slug ?? '');
      const hit = api.current.splits.find((s) => s.slug === want);
      if (hit) { api.current.onSlug(hit.slug); return hit.slug; }
      return api.current.splits.length ? `no live A/B on "${want}"; running: ${api.current.splits.map((s) => s.slug).join(', ')}` : 'no slug is running an A/B right now';
    },
    'admin.recordAbWinner': async () => api.current.recordWinner(),
  });

  if (!splits.length || !readout || !active) {
    const live = pages.filter((p) => p.status === 'live').length;
    return (<Card className="stack-sm">
      <div className="row wrap"><h2 className="grow">{t('admin.ab_h2')}</h2><Badge size="sm" tone="warn">{t('admin.ab_blocked')}</Badge></div>
      <EmptyState icon="target" title={t('admin.ab_need_title')} body={t('admin.ab_need_body', { n: String(live) })}
        action={can('pages.publish') ? <Link to="/studio"><Button variant="outline" size="sm" icon="sparkles">{t('admin.ab_go_studio')}</Button></Link> : undefined} />
      <p className="xs muted">{t('admin.ab_note')}</p>
    </Card>);
  }

  const prospect = prospectById[active.prospect_id];
  const compareRows: CompareRow[] = FUNNEL_STAGES.map((k, i) => {
    const a = readout.sides.find((s) => s.variant === 'A'); const b = readout.sides.find((s) => s.variant === 'B');
    const prev = i === 0 ? null : FUNNEL_STAGES[i - 1];
    return {
      id: k, stage: t(STAGE_KEY[k]),
      aN: a ? a.counts[k] : 0, aRate: a && prev ? rateWithCounts(a.counts[k], a.counts[prev]) : '—',
      bN: b ? b.counts[k] : 0, bRate: b && prev ? rateWithCounts(b.counts[k], b.counts[prev]) : '—',
      diff: a && b && prev ? ppDiff(a.counts[k], a.counts[prev], b.counts[k], b.counts[prev]) : '—',
    };
  });
  const compareCols: Column<CompareRow>[] = [
    { key: 'stage', header: t('admin.stage'), render: (r) => <span className="ad-strong">{r.stage}</span> },
    { key: 'aN', header: `${t('admin.variant', { v: 'A' })} · ${t('admin.sessions')}`, align: 'right', render: (r) => <span className="ad-num">{r.aN}</span> },
    { key: 'aRate', header: `${t('admin.variant', { v: 'A' })} · ${t('admin.of_previous')}`, align: 'right', render: (r) => <span className="ad-num ad-nowrap">{r.aRate}</span> },
    { key: 'bN', header: `${t('admin.variant', { v: 'B' })} · ${t('admin.sessions')}`, align: 'right', render: (r) => <span className="ad-num">{r.bN}</span> },
    { key: 'bRate', header: `${t('admin.variant', { v: 'B' })} · ${t('admin.of_previous')}`, align: 'right', render: (r) => <span className="ad-num ad-nowrap">{r.bRate}</span> },
    { key: 'diff', header: t('admin.ab_diff'), align: 'right', render: (r) => <span className="ad-num ad-nowrap">{r.diff}</span> },
  ];
  const side = (v: 'A' | 'B'): VariantReadout | undefined => readout.sides.find((s) => s.variant === v);
  const verdictTone = readout.verdict === 'leader' ? 'success' : readout.verdict === 'too_close' ? 'info' : 'warn';
  const verdictLabel = readout.verdict === 'leader' ? t('admin.ab_leader', { v: readout.leader ?? '' }) : readout.verdict === 'too_close' ? t('admin.ab_too_close') : t('admin.ab_not_enough');

  return (<Card className="stack-sm">
    <div className="row wrap"><h2 className="grow">{t('admin.ab_h2')}</h2><Badge size="sm" tone={verdictTone}>{verdictLabel}</Badge></div>
    <div className="ad-filter-grid ad-filter-one ad-ab-pick">
      <Field label={t('admin.ab_slug')} hint={t('admin.ab_slug_hint')}>
        <Select value={active.slug} onChange={(e) => onSlug(e.target.value)} options={splits.map((s) => ({ value: s.slug, label: `${s.slug} · ${prospectById[s.prospect_id]?.business_name ?? s.prospect_id}` }))} />
      </Field>
      {prospect && <div className="row wrap"><Link to={`/admin/prospects/${prospect.id}`}><Button size="sm" variant="outline" icon="user">{t('admin.ab_open_timeline')}</Button></Link>
        {can('pages.publish') && <Link to={`/studio/prospects/${prospect.id}/compose`}><Button size="sm" variant="ghost" icon="wand">{t('admin.ab_open_composer')}</Button></Link>}</div>}
    </div>
    <p className="xs muted">{t('admin.ab_scope_note')}</p>

    <div className="grid grid-2 ad-ab-sides">
      {(['A', 'B'] as const).map((v) => { const s = side(v); if (!s) return null; return (
        <Card key={v} padding="sm" tone={readout.leader === v ? 'tint' : 'surface'} className="stack-sm ad-ab-side">
          <div className="row wrap">
            <span className={`ad-ab-dot ad-ab-dot-${v}`} aria-hidden />
            <span className="ad-strong grow">{t('admin.variant', { v })}</span>
            <Badge size="sm">{t(`admin.arch_${s.page.archetype}`)}</Badge>
            <Badge size="sm" status={s.page.status}>{s.page.status}</Badge>
          </div>
          <p className="xs muted">{t('admin.ab_live_since', { at: s.liveSince ? when(s.liveSince) : '—' })}</p>
          <div className="grid grid-auto-sm">
            <Stat label={t('admin.ab_sessions')} value={s.sessions} hint={t('admin.ab_sessions_hint', { n: String(s.metric.from) })} />
            <Stat label={t('admin.kpi_view_demo')} value={pctLabel(s.metric.to, s.metric.from)} tone="accent" hint={`${s.metric.to} / ${s.metric.from} ${t('admin.sessions')}`} />
          </div>
          <div className="row wrap">
            <a href={`#/p/${s.page.slug}?variant=${v}`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost" icon="external-link">{t('admin.ab_open_page', { v })}</Button></a>
          </div>
        </Card>); })}
    </div>

    <PairedBarChart caption={t('admin.ab_chart_caption', { slug: readout.slug })} unitLabel={t('admin.sessions')}
      series={[{ key: 'A', label: t('admin.variant', { v: 'A' }), note: side('A') ? t(`admin.arch_${side('A')!.page.archetype}`) : undefined }, { key: 'B', label: t('admin.variant', { v: 'B' }), note: side('B') ? t(`admin.arch_${side('B')!.page.archetype}`) : undefined }]}
      rows={FUNNEL_STAGES.map((k) => ({ key: k, label: t(STAGE_KEY[k]), values: [side('A')?.counts[k] ?? 0, side('B')?.counts[k] ?? 0] }))} />
    <DataTable caption={t('admin.ab_chart_caption', { slug: readout.slug })} dense rows={compareRows} columns={compareCols} />

    <div className="ad-ab-verdict stack-sm">
      <div className="row wrap"><Badge size="sm" tone={verdictTone}>{verdictLabel}</Badge>
        <span className="xs muted">{t('admin.ab_metric_note', { from: t(STAGE_KEY[AB_METRIC.from]), to: t(STAGE_KEY[AB_METRIC.to]), n: String(readout.minSessions), lift: String(Math.round(readout.minLift * 100)) })}</span></div>
      <p className="small">{readout.verdict === 'not_enough'
        ? t('admin.ab_not_enough_body', { n: String(readout.smallestSample), min: String(readout.minSessions), a: String(side('A')?.metric.from ?? 0), b: String(side('B')?.metric.from ?? 0) })
        : readout.verdict === 'too_close'
          ? t('admin.ab_too_close_body', { lift: String(Math.round(readout.lift * 100)), min: String(Math.round(readout.minLift * 100)) })
          : t('admin.ab_leader_body', { v: readout.leader ?? '', lift: String(Math.round(readout.lift * 100)), a: rateWithCounts(side('A')?.metric.to ?? 0, side('A')?.metric.from ?? 0), b: rateWithCounts(side('B')?.metric.to ?? 0, side('B')?.metric.from ?? 0) })}</p>
      {promotable && (<div className="stack-sm ad-rec">
        <div className="row wrap"><span className="ad-strong grow">{t('admin.ab_rec_h3')}</span>{onFile && <Badge size="sm" tone="info">{t(`admin.rs_${onFile.status}`)}</Badge>}</div>
        <p className="xs muted">{t('admin.ab_rec_body')}</p>
        <div className="row wrap">
          <Button size="sm" variant={onFile ? 'ghost' : 'primary'} icon="check" disabled={!can('prospects.write') || !!onFile} onClick={() => void recordWinner()}>{onFile ? t('admin.ab_rec_on_file', { at: when(String(onFile.created_at)) }) : t('admin.ab_rec_record')}</Button>
          <Placeholder will={t('admin.ab_promote_will', { slug: readout.slug })} by="S-03"><Button size="sm" variant="outline" icon="arrow-right">{t('admin.ab_promote')}</Button></Placeholder>
        </div>
      </div>)}
    </div>
    <p className="xs muted">{t('admin.ab_note')}</p>
  </Card>);
}
