import { useMemo } from 'react';
import { getRoutes, routeStatus } from '../../app/registry';
import { tables } from '../../data/schema';
import { rules } from '../../rules';
import { componentLibrary } from '../../design/library';
import { ROLES, ROLE_LABEL } from '../../auth/roles';
import { ROLE_PERMISSIONS } from '../../auth/permissions';
import { ARCHETYPES, CHANNELS, type ProspectRow, type PageRow, type TouchRow, type EventRow, type BookingRow } from '../../data/schema/core';
import { pickArchetype, priceBand, PRICE_MONTHLY, savings, guessStack } from '../../engine';
import { useTable } from '../../data/DataContext';
import { useT } from '../../i18n';
import { Badge } from '../../components/atom/Badge/Badge';
import { Stat } from '../../components/molecule/Stat/Stat';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { CHAPTER_SLUGS } from './chapters';
import type { Surface } from '../../specs/types';

/** R-M01: every number in a chapter comes from here, never from prose. One directive = one of these blocks. */
export interface LiveBlockProps { name: string; arg: string | null; raw: string }

const pct = (n: number) => `${Math.round(n * 100)} %`;
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const row = <T,>(id: string, v: T) => ({ id, ...v });

export function LiveBlock({ name, arg, raw }: LiveBlockProps) {
  const t = useT();
  switch (name) {
    case 'stats': return <StatsBlock />;
    case 'routes': return <RoutesBlock surface={(arg ?? 'manual') as Surface} />;
    case 'roles': return <RolesBlock />;
    case 'prospects': return <ProspectsBlock />;
    case 'archetypes': return <ArchetypesBlock />;
    case 'pricebands': return <PriceBandsBlock />;
    case 'channels': return <ChannelsBlock />;
    case 'kpi': return <KpiBlock which={arg ?? 'funnel'} />;
    default: return <div className="mn-live mn-live-unknown"><p className="small">{t('manual.unknown_directive', { raw })}</p></div>;
  }
}

const Frame = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const t = useT();
  return (<figure className="mn-live" role="group" aria-label={label}>
    <figcaption className="mn-live-cap eyebrow">{label} <span className="faint">· {t('manual.live_now')}</span></figcaption>
    {children}
  </figure>);
};

function StatsBlock() {
  const t = useT();
  const r = getRoutes();
  const built = r.filter((x) => routeStatus(x) === 'built').length;
  const items = [
    { label: t('manual.stat_routes'), value: r.length }, { label: t('manual.stat_built'), value: built },
    { label: t('manual.stat_stubs'), value: r.length - built }, { label: t('manual.stat_tables'), value: tables.length },
    { label: t('manual.stat_rules'), value: rules.length }, { label: t('manual.stat_components'), value: componentLibrary.length },
    { label: t('manual.stat_chapters'), value: CHAPTER_SLUGS.length },
  ];
  return <Frame label={t('manual.block_stats')}><div className="grid mn-stats">{items.map((i) => <Stat key={i.label} label={i.label} value={i.value} />)}</div></Frame>;
}

function RoutesBlock({ surface }: { surface: Surface }) {
  const t = useT();
  const rows = getRoutes().filter((r) => r.surface === surface).map((r) => row(r.path, { path: r.path, code: r.spec.code, name: r.spec.name, status: routeStatus(r), actions: r.spec.actions.length }));
  return (<Frame label={t('manual.block_routes', { surface })}>
    <DataTable caption={t('manual.block_routes', { surface })} rows={rows} rowHref={(x) => x.path} empty={{ title: t('manual.no_routes', { surface }) }} columns={[
      { key: 'code', header: t('manual.col_code'), render: (x) => <code>{x.code}</code> },
      { key: 'name', header: t('manual.col_page') },
      { key: 'path', header: t('manual.col_route'), render: (x) => <code className="mono xs">{x.path}</code> },
      { key: 'status', header: t('manual.col_status'), render: (x) => <Badge size="sm" status={x.status}>{x.status === 'built' ? t('manual.built') : t('manual.stub')}</Badge> },
      { key: 'actions', header: t('manual.col_actions'), align: 'right' },
    ]} />
  </Frame>);
}

function RolesBlock() {
  const t = useT();
  const rows = ROLES.map((r) => row(r, { role: ROLE_LABEL[r], key: r, perms: ROLE_PERMISSIONS[r].length, sample: ROLE_PERMISSIONS[r].slice(0, 4).join(', ') }));
  return (<Frame label={t('manual.block_roles')}>
    <DataTable caption={t('manual.block_roles')} rows={rows} columns={[
      { key: 'role', header: t('manual.col_role') }, { key: 'key', header: t('manual.col_key'), render: (x) => <code className="mono xs">{x.key}</code> },
      { key: 'perms', header: t('manual.col_perms'), align: 'right' }, { key: 'sample', header: t('manual.col_sample'), render: (x) => <span className="xs muted">{x.sample}…</span> },
    ]} />
  </Frame>);
}

function ProspectsBlock() {
  const t = useT();
  const { rows: prospects } = useTable<ProspectRow>('prospects', { orderBy: { column: 'business_name', dir: 'asc' } });
  const { rows: pages } = useTable<PageRow>('pages');
  const rows = prospects.map((p) => {
    const page = pages.find((pg) => pg.prospect_id === p.id);
    return row(p.id, { business: p.business_name, who: `${p.first_name} ${p.last_name}`, city: p.city, lang: p.lang, team: p.team_size, sites: p.locations, warmth: p.warmth, confidence: pct(p.confidence), page: page ? `${page.archetype} · ${page.status}` : '—' });
  });
  return (<Frame label={t('manual.block_prospects')}>
    <DataTable caption={t('manual.block_prospects')} rows={rows} empty={{ title: t('manual.no_prospects') }} columns={[
      { key: 'business', header: t('manual.col_business') }, { key: 'who', header: t('manual.col_who') },
      { key: 'city', header: t('manual.col_city'), render: (x) => <span>{x.city} <span className="faint xs">{x.lang}</span></span> },
      { key: 'team', header: t('manual.col_team'), align: 'right', render: (x) => <span>{x.team} / {x.sites}</span> },
      { key: 'warmth', header: t('manual.col_warmth'), render: (x) => <Badge size="sm" tone={x.warmth === 'hot' ? 'danger' : x.warmth === 'warm' ? 'warn' : 'info'}>{x.warmth}</Badge> },
      { key: 'confidence', header: t('manual.col_confidence'), align: 'right' }, { key: 'page', header: t('manual.col_live_page') },
    ]} />
  </Frame>);
}

function ArchetypesBlock() {
  const t = useT();
  const { rows: prospects } = useTable<ProspectRow>('prospects', { orderBy: { column: 'business_name', dir: 'asc' } });
  const scored = useMemo(() => prospects.map((p) => ({ p, scores: pickArchetype(p, { guessedTools: guessStack(p).length }) })), [prospects]);
  const rows = ARCHETYPES.map((a) => {
    const wins = scored.filter((s) => s.scores[0].archetype === a).map((s) => s.p.business_name);
    const best = scored.map((s) => s.scores.find((x) => x.archetype === a)).filter(Boolean);
    const top = best.sort((x, y) => (y?.score ?? 0) - (x?.score ?? 0))[0];
    return row(a, { archetype: a, top_score: top?.score ?? 0, wins: wins.length ? wins.join(', ') : '—', reason: top?.reasons[0] ?? '—' });
  });
  return (<Frame label={t('manual.block_archetypes')}>
    <DataTable caption={t('manual.block_archetypes')} rows={rows} empty={{ title: t('manual.no_prospects') }} columns={[
      { key: 'archetype', header: t('manual.col_archetype'), render: (x) => <strong>{x.archetype}</strong> },
      { key: 'top_score', header: t('manual.col_top_score'), align: 'right' },
      { key: 'wins', header: t('manual.col_wins') }, { key: 'reason', header: t('manual.col_reason'), render: (x) => <span className="xs muted">{x.reason}</span> },
    ]} />
  </Frame>);
}

function PriceBandsBlock() {
  const t = useT();
  const shape = [
    { band: 'starter' as const, when: t('manual.band_starter') }, { band: 'team' as const, when: t('manual.band_team') }, { band: 'multi' as const, when: t('manual.band_multi') },
  ];
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const rows = shape.map((s) => row(s.band, { band: s.band, when: s.when, price: usd(PRICE_MONTHLY[s.band]), year: usd(PRICE_MONTHLY[s.band] * 12), who: prospects.filter((p) => priceBand(p) === s.band).map((p) => p.business_name).join(', ') || '—' }));
  return (<Frame label={t('manual.block_pricebands')}>
    <DataTable caption={t('manual.block_pricebands')} rows={rows} columns={[
      { key: 'band', header: t('manual.col_band'), render: (x) => <strong>{x.band}</strong> }, { key: 'when', header: t('manual.col_when') },
      { key: 'price', header: t('manual.col_monthly'), align: 'right' }, { key: 'year', header: t('manual.col_yearly'), align: 'right' }, { key: 'who', header: t('manual.col_who_band') },
    ]} />
  </Frame>);
}

function ChannelsBlock() {
  const t = useT();
  const { rows: touches } = useTable<TouchRow>('touches');
  const rows = CHANNELS.map((c) => {
    const mine = touches.filter((x) => x.channel === c);
    return row(c, { channel: c, sent: mine.filter((x) => x.sent_at).length, opened: mine.filter((x) => x.opened_at).length, clicked: mine.filter((x) => x.clicked_at).length, drafts: mine.filter((x) => x.status === 'draft').length });
  });
  return (<Frame label={t('manual.block_channels')}>
    <DataTable caption={t('manual.block_channels')} rows={rows} columns={[
      { key: 'channel', header: t('manual.col_channel'), render: (x) => <code>{x.channel}</code> },
      { key: 'drafts', header: t('manual.col_drafts'), align: 'right' }, { key: 'sent', header: t('manual.col_sent'), align: 'right' },
      { key: 'opened', header: t('manual.col_opened'), align: 'right' }, { key: 'clicked', header: t('manual.col_clicked'), align: 'right' },
    ]} />
  </Frame>);
}

function KpiBlock({ which }: { which: string }) {
  const t = useT();
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const { rows: events } = useTable<EventRow>('events');
  const { rows: touches } = useTable<TouchRow>('touches');
  const { rows: bookings } = useTable<BookingRow>('bookings');
  const { rows: pages } = useTable<PageRow>('pages');
  const has = (type: string) => events.filter((e) => e.type === type).length;
  const tiles = useMemo(() => {
    switch (which) {
      case 'intake': {
        const avg = prospects.length ? prospects.reduce((s, p) => s + p.confidence, 0) / prospects.length : 0;
        const ready = prospects.filter((p) => p.confidence >= 0.3).length;
        const money = prospects.map((p) => savings(p, guessStack(p)).net_annual);
        return [
          { label: t('manual.kpi_prospects'), value: prospects.length }, { label: t('manual.kpi_avg_confidence'), value: pct(avg) },
          { label: t('manual.kpi_publishable'), value: `${ready} / ${prospects.length}`, hint: t('manual.kpi_publishable_hint') },
          { label: t('manual.kpi_avg_savings'), value: usd(money.length ? money.reduce((a, b) => a + b, 0) / money.length : 0), hint: t('manual.kpi_avg_savings_hint') },
        ];
      }
      case 'outreach': {
        const sent = touches.filter((x) => x.sent_at).length;
        const opened = touches.filter((x) => x.opened_at).length;
        const clicked = touches.filter((x) => x.clicked_at).length;
        return [
          { label: t('manual.kpi_touches'), value: touches.length }, { label: t('manual.kpi_sent'), value: sent },
          { label: t('manual.kpi_open_rate'), value: sent ? pct(opened / sent) : '—', hint: `${opened} / ${sent}` },
          { label: t('manual.kpi_click_rate'), value: opened ? pct(clicked / opened) : '—', hint: `${clicked} / ${opened}` },
        ];
      }
      case 'calls': {
        const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length;
        return [
          { label: t('manual.kpi_bookings'), value: bookings.length }, { label: t('manual.kpi_confirmed'), value: confirmed },
          { label: t('manual.kpi_avg_minutes'), value: bookings.length ? Math.round(bookings.reduce((s, b) => s + b.duration_min, 0) / bookings.length) : 0, hint: t('manual.kpi_avg_minutes_hint') },
          { label: t('manual.kpi_live_pages'), value: pages.filter((p) => p.status === 'live').length },
        ];
      }
      default: {
        const views = has('view');
        return [
          { label: t('manual.kpi_views'), value: views }, { label: t('manual.kpi_cta'), value: has('cta_click'), hint: views ? pct(has('cta_click') / views) : undefined },
          { label: t('manual.kpi_demo'), value: has('demo_open'), hint: views ? pct(has('demo_open') / views) : undefined },
          { label: t('manual.kpi_booked'), value: has('booking_confirmed') || bookings.filter((b) => b.status !== 'requested').length },
        ];
      }
    }
  }, [which, prospects, events, touches, bookings, pages, t]);
  if (!tiles.length) return <EmptyState icon="chart" title={t('manual.no_kpi', { which })} />;
  return <Frame label={t('manual.block_kpi', { which })}><div className="grid mn-stats">{tiles.map((k) => <Stat key={k.label} label={k.label} value={k.value} hint={'hint' in k ? (k.hint as string | undefined) : undefined} />)}</div></Frame>;
}
