import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { Archetype, PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import { ARCHETYPES } from '../../data/schema/core';
import { composePage, pickArchetype, savings } from '../../engine';
import { MIN_PUBLISH_CONFIDENCE, PAGE_TTL_DAYS, expiresAtFrom } from '../../rules/studio';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Stat } from '../../components/molecule/Stat/Stat';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { ViewportFrame } from '../../components/molecule/ViewportFrame/ViewportFrame';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { Input } from '../../components/atom/Input/Input';
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { useToast } from '../../components/molecule/Toast/Toast';
import { ProspectNav } from './ProspectNav';
import { daysLeft, livePageOf, pct, publicPath, publicUrl, slugFor, shortTime, usd } from './lib';
import './studio.css';

export function ComposePage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const p = useRow<ProspectRow>('prospects', id);
  const { rows: guesses } = useTable<StackGuessRow>('stack_guesses', { where: { prospect_id: id ?? '' } });
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: id ?? '' } });
  const page = p ? livePageOf(pages, p.id) : null;

  const ranked = useMemo(() => (p ? pickArchetype(p, { guessedTools: guesses.filter((g) => g.status !== 'rejected').length }) : []), [p, guesses]);
  const [picked, setPicked] = useState<Archetype | null>(null);
  const [variant, setVariant] = useState<string | null>(null);
  const [override, setOverride] = useState(false);
  const [busy, setBusy] = useState(false);
  const archetype: Archetype = picked ?? page?.archetype ?? ranked[0]?.archetype ?? 'reveal';
  const theVariant = variant ?? page?.variant ?? 'A';
  const publishable = can('pages.publish');

  const slug = p ? slugFor(p, page) : '';
  const sav = useMemo(() => (p ? savings(p, guesses) : null), [p, guesses]);
  const gated = !!p && p.confidence < MIN_PUBLISH_CONFIDENCE && !override;

  const publish = async () => {
    if (!p || !publishable) return;
    if (gated) { toast.push({ tone: 'warn', title: t('studio.gate_title'), body: t('studio.gate_body', { pct: pct(MIN_PUBLISH_CONFIDENCE) }) }); return; }
    setBusy(true);
    try {
      const now = new Date();
      const expires = expiresAtFrom(now);
      if (page) {
        const model = composePage(p, archetype, { pageId: page.id, slug, guesses, expiresAt: expires });
        await data.update<PageRow>('pages', page.id, { archetype, slug, variant: theVariant, status: 'live', published_at: now.toISOString(), expires_at: expires, model });
      } else {
        const created = await data.insert<PageRow>('pages', { prospect_id: p.id, archetype, slug, variant: theVariant, status: 'live', published_at: now.toISOString(), expires_at: expires, model: null });
        await data.update<PageRow>('pages', created.id, { model: composePage(p, archetype, { pageId: created.id, slug, guesses, expiresAt: expires }) });
      }
      toast.push({ tone: 'success', title: t('studio.published'), body: t('studio.published_body', { slug, days: PAGE_TTL_DAYS }) });
    } finally { setBusy(false); }
  };

  const expire = async () => { if (!page || !publishable) return; await data.update<PageRow>('pages', page.id, { status: 'expired' }); toast.push({ tone: 'info', title: t('studio.expired'), body: t('studio.expired_body') }); };
  const copyLink = async () => {
    if (!p) return;
    const url = publicUrl(archetype, slug);
    try { await navigator.clipboard.writeText(url); toast.push({ tone: 'success', title: t('studio.copied'), body: url }); }
    catch { toast.push({ tone: 'warn', title: t('studio.copy_failed'), body: url }); }
  };

  const latest = useRef({ publish, expire, copyLink });
  latest.current = { publish, expire, copyLink };
  useActions('S-03', {
    'studio.pickArchetype': (a) => { const v = String(a?.archetype ?? ''); if ((ARCHETYPES as readonly string[]).includes(v)) setPicked(v as Archetype); },
    'studio.setVariant': (a) => setVariant(String(a?.variant ?? 'A').toUpperCase().slice(0, 4)),
    'studio.overrideConfidence': () => setOverride(true),
    'studio.publishPage': () => latest.current.publish(),
    'studio.expirePage': () => latest.current.expire(),
    'studio.copyPageLink': () => latest.current.copyLink(),
  });

  if (!p) return <div className="container page"><EmptyState icon="user" title={t('studio.not_found')} body={t('studio.not_found_body')} action={<Button variant="outline" icon="arrow-left" onClick={() => nav('/studio')}>{t('studio.all_prospects')}</Button>} /></div>;

  const maxScore = Math.max(1, ...ranked.map((r) => r.score));
  const route = publicPath(archetype, slug);
  const left = daysLeft(page?.expires_at ?? null);

  return (
    <div className="container container-wide page stack st-page">
      <ProspectNav p={p} />

      <Card className="stack-sm">
        <div className="row wrap">
          <h1 className="grow">{t('studio.s03_title')}</h1>
          {page ? (<>
            <Badge status={page.status}>{t(`studio.status_${page.status}`)}</Badge>
            <Badge tone="primary">{t(`studio.arch_${page.archetype}`)}</Badge>
            <Badge>{t('studio.variant_n', { v: page.variant })}</Badge>
            {left != null && <span className="xs muted">{left > 0 ? t('studio.days_left', { n: left }) : t('studio.expired_ago')} · {shortTime(page.published_at, lang)}</span>}
          </>) : <Badge tone="warn">{t('studio.no_page')}</Badge>}
        </div>
        <p className="muted small">{t('studio.s03_sub', { days: PAGE_TTL_DAYS })}</p>
        <div className="grid grid-4">
          <Stat label={t('studio.kpi_confidence')} value={pct(p.confidence)} tone={p.confidence >= MIN_PUBLISH_CONFIDENCE ? 'success' : 'danger'} hint={t('studio.gate_hint', { pct: pct(MIN_PUBLISH_CONFIDENCE) })} />
          <Stat label={t('studio.net_year')} value={sav ? usd(sav.net_annual) : '-'} tone="accent" />
          <Stat label={t('studio.tools')} value={sav?.tools_cut ?? 0} />
          <Stat label={t('studio.slug')} value={<code className="st-slug">{slug}</code>} hint={t('studio.slug_hint')} />
        </div>
      </Card>

      <Card className="stack-sm">
        <h2>{t('studio.ranking')}</h2>
        <p className="muted small">{t('studio.ranking_sub')}</p>
        <div className="grid grid-4">
          {ranked.map((r) => (
            <Card key={r.archetype} tone={r.archetype === archetype ? 'tint' : 'surface'} className="stack-sm st-arch">
              <div className="row wrap"><span className="st-strong grow">{t(`studio.arch_${r.archetype}`)}</span>{r.archetype === ranked[0]?.archetype && <Badge size="sm" tone="success">{t('studio.top')}</Badge>}</div>
              <ProgressBar size="sm" label={t('studio.score')} value={r.score} max={maxScore} showValue={false} tone={r.archetype === archetype ? 'primary' : 'accent'} />
              <div className="xs muted">{t('studio.score_n', { n: r.score })}</div>
              <ul className="xs muted st-reasons">{r.reasons.length ? r.reasons.map((x) => <li key={x}>{x}</li>) : <li>{t('studio.no_reasons')}</li>}</ul>
              <Button size="sm" variant={r.archetype === archetype ? 'primary' : 'outline'} icon="check" disabled={!publishable} onClick={() => setPicked(r.archetype)}>{t('studio.use_this')}</Button>
            </Card>
          ))}
        </div>
        <div className="row wrap st-picker">
          <SegmentedControl label={t('studio.archetype')} value={archetype} onChange={(v) => setPicked(v)} options={ARCHETYPES.map((a) => ({ value: a, label: t(`studio.arch_${a}`) }))} />
          <Field label={t('studio.variant')} hint={t('studio.variant_hint')} inline><Input value={theVariant} maxLength={4} onChange={(e) => setVariant(e.target.value.toUpperCase())} /></Field>
          <Chip>{route}</Chip>
        </div>
      </Card>

      <Card className="stack-sm">
        <div className="row wrap"><h2 className="grow">{t('studio.preview')}</h2><span className="xs muted">{t('studio.preview_note')}</span></div>
        <div className="st-previews">
          <ViewportFrame route={route} width={390} height={720} label={t('studio.phone_390')} />
          <ViewportFrame route={route} width={1280} height={860} label={t('studio.desktop_1280')} />
        </div>
      </Card>

      <Card className="stack-sm">
        <h2>{t('studio.publish')}</h2>
        {p.confidence < MIN_PUBLISH_CONFIDENCE && (
          <div className="st-gate">
            <Badge tone="warn">R-S01</Badge>
            <span className="small">{t('studio.gate_body', { pct: pct(MIN_PUBLISH_CONFIDENCE) })}</span>
            <Toggle checked={override} onChange={setOverride} label={t('studio.override')} description={t('studio.override_desc')} />
          </div>
        )}
        <div className="row wrap">
          <Button icon="wand" loading={busy} disabled={!publishable || gated} onClick={() => void publish()}>{page ? t('studio.republish') : t('studio.publish_14', { days: PAGE_TTL_DAYS })}</Button>
          <Button variant="outline" icon="copy" onClick={() => void copyLink()}>{t('studio.copy_link')}</Button>
          <a className="st-link" href={`#${route}`} target="_blank" rel="noreferrer">{t('studio.open_public')}</a>
          {page && page.status === 'live' && <Button variant="danger" icon="clock" disabled={!publishable} onClick={() => void expire()}>{t('studio.expire')}</Button>}
        </div>
        {page && <p className="xs muted">{t('studio.public_link')}: <code>{publicUrl(page.archetype, page.slug)}</code></p>}
      </Card>
    </div>
  );
}
