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
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { useToast } from '../../components/molecule/Toast/Toast';
import { ProspectNav } from './ProspectNav';
import { VARIANTS, daysLeft, livePageOf, normalizeVariant, pct, publicPath, publicPathWithVariant, publicUrlWithVariant, slugFor, shortTime, usd, variantRows, type VariantLabel } from './lib';
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
  const [variant, setVariant] = useState<VariantLabel | null>(null);
  const [override, setOverride] = useState(false);
  const [busy, setBusy] = useState(false);
  const publishable = can('pages.publish');

  const slug = p ? slugFor(p, page) : '';
  /** Both sides of the split on this slug; the landing module picks one per session and honours ?variant= (R-S04). */
  const rows = useMemo(() => (p ? variantRows(pages, p.id, slug) : []), [pages, p, slug]);
  const theVariant: VariantLabel = variant ?? normalizeVariant(page?.variant);
  const current = rows.find((r) => r.variant === theVariant)?.row ?? null;
  const other = rows.find((r) => r.variant !== theVariant)?.row ?? null;
  const archetype: Archetype = picked ?? current?.archetype ?? ranked[0]?.archetype ?? 'reveal';
  const liveCount = rows.filter((r) => r.row?.status === 'live').length;

  const sav = useMemo(() => (p ? savings(p, guesses) : null), [p, guesses]);
  const gated = !!p && p.confidence < MIN_PUBLISH_CONFIDENCE && !override;

  /** Publish (or republish) one side of the split. A second live row on the same slug is the A/B test (R-S04). */
  const publish = async (target: VariantLabel = theVariant, arch: Archetype = archetype) => {
    if (!p || !publishable) return;
    if (gated) { toast.push({ tone: 'warn', title: t('studio.gate_title'), body: t('studio.gate_body', { pct: pct(MIN_PUBLISH_CONFIDENCE) }) }); return; }
    setBusy(true);
    try {
      const now = new Date();
      const expires = expiresAtFrom(now);
      const row = rows.find((r) => r.variant === target)?.row ?? null;
      if (row) {
        const model = composePage(p, arch, { pageId: row.id, slug, guesses, expiresAt: expires });
        await data.update<PageRow>('pages', row.id, { archetype: arch, slug, variant: target, status: 'live', published_at: now.toISOString(), expires_at: expires, model });
      } else {
        const created = await data.insert<PageRow>('pages', { prospect_id: p.id, archetype: arch, slug, variant: target, status: 'live', published_at: now.toISOString(), expires_at: expires, model: null });
        await data.update<PageRow>('pages', created.id, { model: composePage(p, arch, { pageId: created.id, slug, guesses, expiresAt: expires }) });
      }
      setVariant(target);
      toast.push({ tone: 'success', title: t('studio.published'), body: t('studio.published_variant_body', { slug, v: target, days: PAGE_TTL_DAYS }) });
    } finally { setBusy(false); }
  };

  const expire = async (target: VariantLabel = theVariant) => {
    const row = rows.find((r) => r.variant === target)?.row;
    if (!row || !publishable) return;
    await data.update<PageRow>('pages', row.id, { status: 'expired' });
    toast.push({ tone: 'info', title: t('studio.expired'), body: t('studio.expired_variant_body', { v: target }) });
  };

  const copyLink = async (target: VariantLabel = theVariant) => {
    if (!p) return;
    const row = rows.find((r) => r.variant === target)?.row;
    const url = publicUrlWithVariant(row?.archetype ?? archetype, slug, target);
    try { await navigator.clipboard.writeText(url); toast.push({ tone: 'success', title: t('studio.copied'), body: url }); }
    catch { toast.push({ tone: 'warn', title: t('studio.copy_failed'), body: url }); }
    return url;
  };

  const latest = useRef({ publish, expire, copyLink });
  latest.current = { publish, expire, copyLink };
  useActions('S-03', {
    'studio.pickArchetype': (a) => { const v = String(a?.archetype ?? ''); if ((ARCHETYPES as readonly string[]).includes(v)) setPicked(v as Archetype); },
    'studio.setVariant': (a) => setVariant(normalizeVariant(String(a?.variant ?? 'A'))),
    'studio.overrideConfidence': () => setOverride(true),
    'studio.publishPage': () => latest.current.publish(),
    'studio.publishVariant': (a) => { const v = normalizeVariant(String(a?.variant ?? 'B')); const arch = String(a?.archetype ?? ''); return latest.current.publish(v, (ARCHETYPES as readonly string[]).includes(arch) ? (arch as Archetype) : undefined); },
    'studio.expirePage': () => latest.current.expire(),
    'studio.expireVariant': (a) => latest.current.expire(normalizeVariant(String(a?.variant ?? 'B'))),
    'studio.copyPageLink': () => latest.current.copyLink(),
    'studio.copyVariantLink': (a) => latest.current.copyLink(normalizeVariant(String(a?.variant ?? 'A'))),
  });

  if (!p) return <div className="container page"><EmptyState icon="user" title={t('studio.not_found')} body={t('studio.not_found_body')} action={<Button variant="outline" icon="arrow-left" onClick={() => nav('/studio')}>{t('studio.all_prospects')}</Button>} /></div>;

  const maxScore = Math.max(1, ...ranked.map((r) => r.score));
  const route = publicPath(archetype, slug);
  const previewRoute = publicPathWithVariant(archetype, slug, theVariant);
  const left = daysLeft(current?.expires_at ?? null);

  return (
    <div className="container container-wide page stack st-page">
      <ProspectNav p={p} />

      <Card className="stack-sm">
        <div className="row wrap">
          <h1 className="grow">{t('studio.s03_title')}</h1>
          {current ? (<>
            <Badge status={current.status}>{t(`studio.status_${current.status}`)}</Badge>
            <Badge tone="primary">{t(`studio.arch_${current.archetype}`)}</Badge>
            <Badge>{t('studio.variant_n', { v: theVariant })}</Badge>
            {left != null && <span className="xs muted">{left > 0 ? t('studio.days_left', { n: left }) : t('studio.expired_ago')} · {shortTime(current.published_at, lang)}</span>}
          </>) : <Badge tone="warn">{t('studio.no_variant_yet', { v: theVariant })}</Badge>}
          {liveCount > 1 && <Badge tone="success">{t('studio.split_running')}</Badge>}
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
        <div className="row wrap"><h2 className="grow">{t('studio.variants')}</h2><Badge size="sm" tone={liveCount > 1 ? 'success' : 'neutral'}>{t('studio.live_variants_n', { n: liveCount })}</Badge></div>
        <p className="muted small">{t('studio.variants_sub')}</p>
        <div className="grid grid-2">
          {rows.map(({ variant: v, row }) => (
            <Card key={v} tone={v === theVariant ? 'tint' : 'surface'} padding="sm" className="stack-sm st-variant">
              <div className="row wrap">
                <span className="st-strong grow">{t('studio.variant_n', { v })}</span>
                {row ? <><Badge size="sm" status={row.status}>{t(`studio.status_${row.status}`)}</Badge><Badge size="sm" tone="primary">{t(`studio.arch_${row.archetype}`)}</Badge></> : <Badge size="sm" tone="warn">{t('studio.not_published')}</Badge>}
              </div>
              {row ? (<>
                <div className="xs muted">{row.published_at ? t('studio.published_at', { when: shortTime(row.published_at, lang) }) : t('studio.never')}{(() => { const d = daysLeft(row.expires_at); return d == null ? '' : ` · ${d > 0 ? t('studio.days_left', { n: d }) : t('studio.expired_ago')}`; })()}</div>
                <code className="st-slug st-block">{publicPathWithVariant(row.archetype, row.slug, v)}</code>
                <div className="row wrap st-cell-gap">
                  <a className="st-link" href={`#${publicPathWithVariant(row.archetype, row.slug, v)}`} target="_blank" rel="noreferrer">{t('studio.open_variant', { v })}</a>
                  <Button size="sm" variant="outline" icon="copy" onClick={() => void copyLink(v)}>{t('studio.copy_link')}</Button>
                  {row.status === 'live' && <Button size="sm" variant="danger" icon="clock" disabled={!publishable} onClick={() => void expire(v)}>{t('studio.expire')}</Button>}
                  {row.status !== 'live' && <Button size="sm" icon="wand" loading={busy} disabled={!publishable || gated} onClick={() => void publish(v, row.archetype)}>{t('studio.republish')}</Button>}
                </div>
              </>) : (<>
                <p className="xs muted">{v === 'B' ? t('studio.variant_b_hint') : t('studio.variant_a_hint')}</p>
                <div className="row wrap st-cell-gap">
                  <Button size="sm" variant={v === theVariant ? 'primary' : 'outline'} icon="plus" loading={busy} disabled={!publishable || gated} onClick={() => void publish(v)}>{t('studio.publish_variant', { v })}</Button>
                  <Button size="sm" variant="ghost" icon="edit" onClick={() => setVariant(v)}>{t('studio.edit_variant', { v })}</Button>
                </div>
              </>)}
            </Card>
          ))}
        </div>
        {other?.status === 'live' && current?.status === 'live' && other.archetype === current.archetype && <p className="xs muted">{t('studio.same_archetype_warn')}</p>}
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
          <Field label={t('studio.variant')} hint={t('studio.variant_hint')} inline>
            <SegmentedControl size="sm" label={t('studio.variant')} value={theVariant} onChange={(v) => { setVariant(v); setPicked(null); }} options={VARIANTS.map((v) => ({ value: v, label: t('studio.variant_n', { v }) }))} />
          </Field>
          <Chip>{route}</Chip>
        </div>
      </Card>

      <Card className="stack-sm">
        <div className="row wrap"><h2 className="grow">{t('studio.preview')}</h2><span className="xs muted">{t('studio.preview_note')}</span></div>
        <div className="st-previews">
          <ViewportFrame route={previewRoute} width={390} height={720} label={t('studio.phone_390')} />
          <ViewportFrame route={previewRoute} width={1280} height={860} label={t('studio.desktop_1280')} />
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
          <Button icon="wand" loading={busy} disabled={!publishable || gated} onClick={() => void publish()}>{current ? t('studio.republish_variant', { v: theVariant }) : t('studio.publish_14_variant', { days: PAGE_TTL_DAYS, v: theVariant })}</Button>
          <Button variant="outline" icon="copy" onClick={() => void copyLink()}>{t('studio.copy_link')}</Button>
          <a className="st-link" href={`#${previewRoute}`} target="_blank" rel="noreferrer">{t('studio.open_public')}</a>
          {current && current.status === 'live' && <Button variant="danger" icon="clock" disabled={!publishable} onClick={() => void expire()}>{t('studio.expire')}</Button>}
        </div>
        {current && <p className="xs muted">{t('studio.public_link')}: <code>{publicUrlWithVariant(current.archetype, current.slug, theVariant)}</code></p>}
      </Card>
    </div>
  );
}
