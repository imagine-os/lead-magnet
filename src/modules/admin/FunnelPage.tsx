import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTable, indexById } from '../../data/DataContext';
import type { BookingRow, EventRow, PageRow, ProspectRow } from '../../data/schema/core';
import { ARCHETYPES, WARMTH } from '../../data/schema/core';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FunnelChart } from '../../components/molecule/FunnelChart/FunnelChart';
import { FUNNEL_STAGES, STAGE_KEY, countSessions, groupSessions, pctLabel, type StageCounts } from './funnel';
import { AbReadout } from './AbReadout';
import { EVENT_ICON, eventSummary, when } from './timeline';
import './admin.css';

type ArchFilter = 'all' | (typeof ARCHETYPES)[number];
type WarmFilter = 'all' | (typeof WARMTH)[number];
/** One date-range vocabulary for the staff surfaces: 7 / 30 / 90 days, or everything ever tracked. */
export const RANGES = ['7', '30', '90', 'all'] as const;
export type RangeKey = (typeof RANGES)[number];
const sinceOf = (r: RangeKey): string | null => (r === 'all' ? null : new Date(Date.now() - Number(r) * 86400000).toISOString());
interface BreakRow extends StageCounts { id: string; label: string; conv: string }

/** A-01 - the whole funnel in one screen: a date range, KPIs, the five stages, the same five by archetype and warmth, the A/B readout for a slug running a split, and what just happened. */
export function FunnelPage() {
  const { t } = useI18n(); const nav = useNavigate();
  const { rows: events } = useTable<EventRow>('events');
  const { rows: pages } = useTable<PageRow>('pages');
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const { rows: bookings } = useTable<BookingRow>('bookings');
  const [arch, setArch] = useState<ArchFilter>('all');
  const [warm, setWarm] = useState<WarmFilter>('all');
  const [range, setRange] = useState<RangeKey>('30');
  const [params, setParams] = useSearchParams();
  const abSlug = params.get('slug') ?? '';
  const setAbSlug = (slug: string) => { const next = new URLSearchParams(params); if (slug) next.set('slug', slug); else next.delete('slug'); setParams(next, { replace: true }); };

  const pageById = useMemo(() => indexById(pages), [pages]);
  const prospectById = useMemo(() => indexById(prospects), [prospects]);
  const archOf = (e: EventRow) => (e.page_id ? pageById[e.page_id]?.archetype : undefined);
  const warmOf = (e: EventRow) => (e.prospect_id ? prospectById[e.prospect_id]?.warmth : undefined);

  /** The date range applies to the whole page; the A/B readout takes THIS list, not the filtered one (below). */
  const ranged = useMemo(() => { const since = sinceOf(range); return since ? events.filter((e) => String(e.ts) >= since) : events; }, [events, range]);
  const shown = useMemo(() => ranged.filter((e) => (arch === 'all' || archOf(e) === arch) && (warm === 'all' || warmOf(e) === warm)), [ranged, arch, warm, pageById, prospectById]);
  const counts = useMemo(() => countSessions(shown), [shown]);
  const inScope = useMemo(() => prospects.filter((p) => (warm === 'all' || p.warmth === warm) && (arch === 'all' || pages.some((g) => g.prospect_id === p.id && g.archetype === arch))), [prospects, pages, arch, warm]);
  const scopeIds = new Set(inScope.map((p) => p.id));
  const livePages = pages.filter((g) => g.status === 'live' && scopeIds.has(g.prospect_id) && (arch === 'all' || g.archetype === arch));
  const scopeBookings = bookings.filter((b) => scopeIds.has(b.prospect_id));

  const stages = FUNNEL_STAGES.map((k) => ({ key: k, label: t(STAGE_KEY[k]), value: counts[k], hint: t('admin.funnel_top') }));
  const stageRows = stages.map((s, i) => ({ id: s.key, stage: s.label, sessions: s.value, step: i === 0 ? '—' : pctLabel(s.value, stages[i - 1].value), overall: pctLabel(s.value, stages[0].value) }));
  const breakCols: Column<BreakRow>[] = [{ key: 'label', header: t('admin.group'), render: (r) => <span className="ad-strong">{r.label}</span> }, ...FUNNEL_STAGES.map((k) => ({ key: k, header: t(STAGE_KEY[k]), align: 'right' as const, render: (r: BreakRow) => <span className="ad-num">{r[k]}</span> })), { key: 'conv', header: t('admin.view_to_book'), align: 'right', render: (r) => <span className="ad-num">{r.conv}</span> }];
  const toBreakRows = (groups: { key: string; counts: StageCounts }[], label: (k: string) => string): BreakRow[] => groups.map((g) => ({ id: g.key, label: label(g.key), ...g.counts, conv: pctLabel(g.counts.booking_confirmed, g.counts.view) }));
  const byArchetype = toBreakRows(groupSessions(shown, archOf), (k) => t(`admin.arch_${k}`));
  const byWarmth = toBreakRows(groupSessions(shown, warmOf), (k) => t(`admin.warm_${k}`));
  const recent = useMemo(() => [...ranged].sort((a, b) => String(b.ts).localeCompare(String(a.ts))).slice(0, 12), [ranged]);

  const api = useRef({ setArch, setWarm, setRange });
  api.current = { setArch, setWarm, setRange };
  useActions('A-01', {
    'admin.filterFunnel': (p) => {
      const a = String(p?.archetype ?? ''); const w = String(p?.warmth ?? ''); const r = String(p?.range ?? '');
      if (a) api.current.setArch((ARCHETYPES as readonly string[]).includes(a) ? (a as ArchFilter) : 'all');
      if (w) api.current.setWarm((WARMTH as readonly string[]).includes(w) ? (w as WarmFilter) : 'all');
      if (r) api.current.setRange((RANGES as readonly string[]).includes(r) ? (r as RangeKey) : '30');
      if (!a && !w && !r) { api.current.setArch('all'); api.current.setWarm('all'); api.current.setRange('30'); }
      return { archetype: a || 'all', warmth: w || 'all', range: r || range };
    },
    'admin.openProspect': (p) => { const id = String(p?.prospect ?? ''); if (id) nav(`/admin/prospects/${id}`); return id; },
    'admin.openStudio': () => { nav('/studio'); return '/studio'; },
  });

  return (<div className="container container-wide page stack ad">
    <div className="page-head"><div><h1>{t('admin.funnel_h1')}</h1><p className="xs muted">{t('admin.funnel_sub')}</p></div><Badge tone="primary" size="sm">A-01</Badge></div>

    <Card padding="sm" className="ad-filters">
      <div className="row wrap"><span className="eyebrow">{t('admin.filter_archetype')}</span>
        <Chip selected={arch === 'all'} onClick={() => setArch('all')}>{t('admin.all')}</Chip>
        {ARCHETYPES.map((a) => <Chip key={a} selected={arch === a} onClick={() => setArch(a)}>{t(`admin.arch_${a}`)}</Chip>)}
      </div>
      <div className="row wrap"><span className="eyebrow">{t('admin.filter_warmth')}</span>
        <Chip selected={warm === 'all'} onClick={() => setWarm('all')}>{t('admin.all')}</Chip>
        {WARMTH.map((w) => <Chip key={w} selected={warm === w} onClick={() => setWarm(w)}>{t(`admin.warm_${w}`)}</Chip>)}
      </div>
      <div className="row wrap"><span className="eyebrow">{t('admin.filter_range')}</span>
        <SegmentedControl size="sm" label={t('admin.filter_range')} value={range} onChange={(r) => setRange(r)} options={RANGES.map((r) => ({ value: r, label: r === 'all' ? t('admin.range_all') : t('admin.range_days', { n: r }) }))} />
        <span className="xs muted">{t('admin.range_note', { shown: String(ranged.length), all: String(events.length) })}</span>
      </div>
    </Card>

    <div className="grid grid-auto-sm ad-kpis">
      <Stat label={t('admin.kpi_prospects')} value={inScope.length} hint={t('admin.kpi_prospects_hint')} />
      <Stat label={t('admin.kpi_live_pages')} value={livePages.length} hint={t('admin.kpi_live_pages_hint')} />
      <Stat label={t('admin.kpi_views')} value={counts.view} hint={t('admin.sessions')} />
      <Stat label={t('admin.kpi_demo_opens')} value={counts.demo_open} hint={t('admin.sessions')} />
      <Stat label={t('admin.kpi_bookings')} value={scopeBookings.length} hint={t('admin.kpi_bookings_hint', { n: String(counts.booking_confirmed) })} />
      <Stat label={t('admin.kpi_view_demo')} value={pctLabel(counts.demo_open, counts.view)} tone="accent" hint={t('admin.kpi_view_demo_hint')} />
      <Stat label={t('admin.kpi_demo_book')} value={pctLabel(counts.booking_confirmed, counts.demo_open)} tone="accent" hint={t('admin.kpi_demo_book_hint')} />
    </div>

    <Card className="stack-sm">
      <FunnelChart stages={stages} caption={t('admin.funnel_caption')} unitLabel={t('admin.sessions')} stepLabel={t('admin.of_previous')} tableLabel={t('admin.table_view')}
        tableFallback={<DataTable caption={t('admin.funnel_caption')} dense rows={stageRows} columns={[{ key: 'stage', header: t('admin.stage') }, { key: 'sessions', header: t('admin.sessions'), align: 'right' }, { key: 'step', header: t('admin.of_previous'), align: 'right' }, { key: 'overall', header: t('admin.of_first'), align: 'right' }]} />} />
      <p className="xs muted">{t('admin.funnel_note')}</p>
    </Card>

    <div className="grid grid-2 ad-breaks">
      <Card className="stack-sm"><h2>{t('admin.by_archetype')}</h2>
        <DataTable caption={t('admin.by_archetype')} dense rows={byArchetype} columns={breakCols} empty={{ title: t('admin.no_events'), body: t('admin.no_events_body') }} /></Card>
      <Card className="stack-sm"><h2>{t('admin.by_warmth')}</h2>
        <DataTable caption={t('admin.by_warmth')} dense rows={byWarmth} columns={breakCols} empty={{ title: t('admin.no_events'), body: t('admin.no_events_body') }} /></Card>
    </div>

    <AbReadout pages={pages} events={ranged} prospectById={prospectById} slug={abSlug} onSlug={setAbSlug} />

    <Card className="stack-sm"><h2>{t('admin.recent')}</h2>
      {recent.length === 0 ? <EmptyState icon="list" title={t('admin.no_events')} body={t('admin.no_events_body')} /> : (<ul className="ad-recent">
        {recent.map((e) => { const p = e.prospect_id ? prospectById[e.prospect_id] : undefined; return (<li key={e.id}>
          <span className="ad-recent-icon" aria-hidden><Icon name={(EVENT_ICON[e.type] ?? 'info') as IconName} size={16} /></span>
          <span className="ad-recent-when xs muted">{when(String(e.ts))}</span>
          <span className="ad-recent-what">{t(`admin.ev_${e.type}`)}<span className="xs muted"> {eventSummary(e)}</span></span>
          <span className="ad-recent-who">{p ? <Link to={`/admin/prospects/${p.id}`}>{p.business_name}</Link> : <span className="xs muted">—</span>}</span>
        </li>); })}
      </ul>)}
    </Card>
  </div>);
}
