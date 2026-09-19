import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import { SOURCES, WARMTH, type BookingRow, type EventRow, type PageRow, type ProspectRow, type Warmth } from '../../data/schema/core';
import { computeConfidence, guessStack, industry } from '../../engine';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { Modal } from '../../components/organism/Modal/Modal';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { Input } from '../../components/atom/Input/Input';
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
import { Select } from '../../components/atom/Select/Select';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { useToast } from '../../components/molecule/Toast/Toast';
import { defaultStyle, industryLabel, industryOptions, fullName, livePageOf, daysLeft, shortTime } from './lib';
import './studio.css';

interface NewForm { first_name: string; last_name: string; business_name: string; industry: string; city: string; lang: 'en' | 'es'; warmth: Warmth; source: (typeof SOURCES)[number]; team_size: string }
const EMPTY: NewForm = { first_name: '', last_name: '', business_name: '', industry: 'pet_care', city: '', lang: 'en', warmth: 'cold', source: 'cold_email', team_size: '6' };
/** What the new-prospect form establishes; confidence is the weighted share of these (R-E03). */
const KNOWN_ON_CREATE = ['first_name', 'business_name', 'industry', 'city', 'lang', 'warmth', 'team_size', 'business_roles', 'life_roles'];

export function ProspectsPage() {
  const { t, bi, lang } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const { rows: prospects } = useTable<ProspectRow>('prospects', { orderBy: { column: 'updated_at', dir: 'desc' } });
  const { rows: pages } = useTable<PageRow>('pages');
  const { rows: events } = useTable<EventRow>('events');
  const { rows: bookings } = useTable<BookingRow>('bookings');

  const [warmth, setWarmth] = useState<'all' | Warmth>('all');
  const [ind, setInd] = useState('all');
  const [liveOnly, setLiveOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewForm>(EMPTY);
  const [busy, setBusy] = useState(false);
  const writable = can('prospects.write');

  const lastEvent = useMemo(() => {
    const m: Record<string, string> = {};
    for (const e of events) { const k = e.prospect_id; if (!k) continue; const ts = String(e.ts ?? e.created_at); if (!m[k] || ts > m[k]) m[k] = ts; }
    return m;
  }, [events]);
  const lastBooking = useMemo(() => {
    const m: Record<string, BookingRow> = {};
    for (const b of bookings) { const prev = m[b.prospect_id]; if (!prev || String(b.slot) > String(prev.slot)) m[b.prospect_id] = b; }
    return m;
  }, [bookings]);
  const pageOf = useMemo(() => Object.fromEntries(prospects.map((p) => [p.id, livePageOf(pages, p.id)])), [pages, prospects]);

  const rows = useMemo(() => prospects.filter((p) => (warmth === 'all' || p.warmth === warmth) && (ind === 'all' || p.industry === ind) && (!liveOnly || pageOf[p.id]?.status === 'live')), [prospects, warmth, ind, liveOnly, pageOf]);

  const create = async (f: NewForm) => {
    if (!f.business_name.trim() || !f.first_name.trim()) { toast.push({ tone: 'warn', title: t('studio.new_needs_fields') }); return; }
    setBusy(true);
    try {
      const cat = industry(f.industry);
      const fields_known = [...KNOWN_ON_CREATE];
      const row: Partial<ProspectRow> = {
        first_name: f.first_name.trim(), last_name: f.last_name.trim(), business_name: f.business_name.trim(), industry: f.industry, sub_industry: null,
        city: f.city.trim(), country: 'US', lang: f.lang, website: null, team_size: Math.max(1, Number(f.team_size) || 1), locations: 1,
        revenue_band: 'lt250k', warmth: f.warmth, source: f.source, style: defaultStyle(),
        business_roles: cat.business_roles.slice(0, 4), life_roles: cat.life_roles.slice(0, 4), known_tools: [],
        confidence: computeConfidence(fields_known), fields_known, notes: '', logo_url: null, photo_url: null,
      };
      const created = await data.insert<ProspectRow>('prospects', row);
      for (const g of guessStack(created)) await data.insert('stack_guesses', { prospect_id: created.id, ...g });
      toast.push({ tone: 'success', title: t('studio.new_created', { business: created.business_name }), body: t('studio.new_created_body') });
      setOpen(false); setForm(EMPTY);
      nav(`/studio/prospects/${created.id}`);
      return created.id;
    } finally { setBusy(false); }
  };

  const latest = useRef({ form, create, prospects });
  latest.current = { form, create, prospects };
  useActions('S-01', {
    'studio.newProspect': () => setOpen(true),
    'studio.createProspect': (p) => latest.current.create({ ...latest.current.form, business_name: String(p?.business ?? latest.current.form.business_name), industry: String(p?.industry ?? latest.current.form.industry) }),
    'studio.filterProspects': (p) => { if (p?.warmth) setWarmth(p.warmth as Warmth | 'all'); if (p?.industry) setInd(String(p.industry)); if (p?.live != null) setLiveOnly(String(p.live) === 'true'); },
    'studio.openProspect': (p) => {
      const q = String(p?.name ?? '').toLowerCase();
      const hit = latest.current.prospects.find((x) => x.business_name.toLowerCase().includes(q) || fullName(x).toLowerCase().includes(q));
      if (hit) nav(`/studio/prospects/${hit.id}`);
      return hit?.id;
    },
  });

  const columns: Column<ProspectRow>[] = [
    { key: 'name', header: t('studio.col_name'), render: (p) => <span className="st-strong">{fullName(p)}</span> },
    { key: 'business_name', header: t('studio.col_business'), render: (p) => <span>{p.business_name}<span className="xs muted st-block">{p.city}</span></span> },
    { key: 'industry', header: t('studio.col_industry'), render: (p) => <span className="xs">{industryLabel(p.industry, bi)}</span> },
    { key: 'warmth', header: t('studio.col_warmth'), render: (p) => <Chip selected={p.warmth === 'hot'}>{t(`studio.warmth_${p.warmth}`)}</Chip> },
    { key: 'confidence', header: t('studio.col_confidence'), width: '160px', render: (p) => <ProgressBar size="sm" label={t('studio.confidence')} value={Math.round(p.confidence * 100)} tone={p.confidence >= 0.6 ? 'success' : p.confidence >= 0.3 ? 'primary' : 'warn'} /> },
    { key: 'page', header: t('studio.col_page'), render: (p) => {
      const pg = pageOf[p.id];
      if (!pg) return <span className="xs muted">{t('studio.no_page')}</span>;
      const d = daysLeft(pg.expires_at);
      return (<span className="row wrap st-cell-gap"><Badge size="sm" tone="primary">{t(`studio.arch_${pg.archetype}`)}</Badge><Badge size="sm" status={pg.status}>{t(`studio.status_${pg.status}`)}</Badge>{d != null && <span className="xs muted">{d > 0 ? t('studio.days_left', { n: d }) : t('studio.expired_ago')}</span>}</span>);
    } },
    { key: 'last_event', header: t('studio.col_last_event'), render: (p) => <span className="xs muted">{lastEvent[p.id] ? shortTime(lastEvent[p.id], lang) : t('studio.never')}</span> },
    { key: 'booking', header: t('studio.col_booking'), render: (p) => { const b = lastBooking[p.id]; return b ? <Badge size="sm" tone={b.status === 'confirmed' || b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'info'}>{t(`studio.booking_${b.status}`)}</Badge> : <span className="xs muted">{t('studio.no_booking')}</span>; } },
  ];

  const livePages = prospects.filter((p) => pageOf[p.id]?.status === 'live').length;
  const avgConfidence = prospects.length ? Math.round((prospects.reduce((s, p) => s + p.confidence, 0) / prospects.length) * 100) : 0;

  return (
    <div className="container container-wide page stack st-page">
      <div className="page-head">
        <div><h1>{t('studio.s01_title')}</h1><p className="muted small">{t('studio.s01_sub')}</p></div>
        <Button icon="plus" onClick={() => setOpen(true)} disabled={!writable}>{t('studio.new_prospect')}</Button>
      </div>

      <div className="grid grid-4">
        <Stat label={t('studio.kpi_prospects')} value={prospects.length} />
        <Stat label={t('studio.kpi_live')} value={livePages} tone="success" hint={t('studio.kpi_live_hint')} />
        <Stat label={t('studio.kpi_confidence')} value={`${avgConfidence}%`} tone={avgConfidence >= 60 ? 'success' : 'warn'} />
        <Stat label={t('studio.kpi_bookings')} value={bookings.length} tone="accent" />
      </div>

      <Card padding="sm" className="stack-sm">
        <div className="eyebrow">{t('studio.filters')}</div>
        <div className="row wrap st-filters">
          <div className="row wrap" role="group" aria-label={t('studio.col_warmth')}>
            <Chip selected={warmth === 'all'} onClick={() => setWarmth('all')}>{t('studio.all')}</Chip>
            {WARMTH.map((w) => <Chip key={w} selected={warmth === w} onClick={() => setWarmth(w)}>{t(`studio.warmth_${w}`)}</Chip>)}
          </div>
          <label className="st-inline-field">
            <span className="xs muted">{t('studio.col_industry')}</span>
            <Select aria-label={t('studio.col_industry')} value={ind} onChange={(e) => setInd(e.target.value)} options={[{ value: 'all', label: t('studio.all_industries') }, ...industryOptions(bi)]} />
          </label>
          <Toggle checked={liveOnly} onChange={setLiveOnly} label={t('studio.only_live')} />
          <span className="xs muted">{t('studio.showing', { n: rows.length, total: prospects.length })}</span>
        </div>
      </Card>

      <DataTable
        caption={t('studio.s01_title')}
        rows={rows}
        columns={columns}
        rowHref={(p) => `/studio/prospects/${p.id}`}
        empty={{ title: t('studio.empty_title'), body: t('studio.empty_body') }}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={t('studio.new_prospect')} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>{t('studio.cancel')}</Button><Button icon="sparkles" loading={busy} onClick={() => void create(form)}>{t('studio.create_and_intake')}</Button></>}>
        <div className="stack-sm">
          <p className="xs muted">{t('studio.new_hint')}</p>
          <div className="grid grid-2">
            <Field label={t('studio.f_first_name')} required><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} autoComplete="off" /></Field>
            <Field label={t('studio.f_last_name')}><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} autoComplete="off" /></Field>
          </div>
          <Field label={t('studio.f_business')} required hint={t('studio.f_business_hint')}><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} autoComplete="off" /></Field>
          <div className="grid grid-2">
            <Field label={t('studio.f_industry')} hint={t('studio.f_industry_hint')}><Select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} options={industryOptions(bi)} /></Field>
            <Field label={t('studio.f_city')}><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} autoComplete="off" /></Field>
          </div>
          <div className="grid grid-2">
            <Field label={t('studio.f_lang')}><Select value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value === 'es' ? 'es' : 'en' })} options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }]} /></Field>
            <Field label={t('studio.f_warmth')}><Select value={form.warmth} onChange={(e) => setForm({ ...form, warmth: e.target.value as Warmth })} options={WARMTH.map((w) => ({ value: w, label: t(`studio.warmth_${w}`) }))} /></Field>
          </div>
          <div className="grid grid-2">
            <Field label={t('studio.f_source')}><Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as NewForm['source'] })} options={SOURCES.map((s) => ({ value: s, label: t(`studio.source_${s}`) }))} /></Field>
            <Field label={t('studio.f_team_size')} hint={t('studio.f_team_size_hint')}><Input type="number" min={1} value={form.team_size} onChange={(e) => setForm({ ...form, team_size: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
