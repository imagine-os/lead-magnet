import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { track } from '../../tracking';
import { INDUSTRY_KEYS, INDUSTRIES, PRICE_MONTHLY, guessStack, priceBand, savings } from '../../engine';
import type { Savings } from '../../engine';
import type { ProspectRow } from '../../data/schema/core';
import { SiteChrome } from './SiteChrome';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Field } from '../../components/molecule/Field/Field';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';

type Band = Savings['price_band'];
const BANDS: Band[] = ['starter', 'team', 'multi'];
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
interface ToolLine { id: string; tool: string; category: string; monthly_cost: number; replaced_by: string }

/** A throwaway prospect so the public calculator runs exactly the engine a real prospect gets (R-W01). */
function syntheticProspect(industryKey: string, team: number, locations: number): ProspectRow {
  const now = new Date().toISOString();
  return {
    id: 'pro_calculator', created_at: now, updated_at: now,
    first_name: 'You', last_name: '', business_name: 'Your business', industry: industryKey, sub_industry: null, city: '', country: 'US', lang: 'en', website: null,
    team_size: team, locations, revenue_band: '250k_1m', warmth: 'cold', source: 'inbound',
    style: { palette: { primary: '#2563EB', accent: '#A3E635', bg: '#FFFFFF', surface: '#FFFFFF', text: '#111111' }, tone: 'clean', font: 'display', imagery: [] },
    life_roles: [], business_roles: [], known_tools: [], confidence: 0.5, fields_known: [], notes: '', logo_url: null, photo_url: null,
  };
}

export function PricingPage() {
  const { t, bi } = useI18n();
  const { devMode } = useSession();
  const nav = useNavigate();
  const [industryKey, setIndustryKey] = useState<string>('pet_care');
  const [team, setTeam] = useState<number>(9);
  const [locations, setLocations] = useState<number>(1);
  const [chosen, setChosen] = useState<Band | null>(null);
  const checkoutRef = useRef<HTMLDivElement | null>(null);

  const result = useMemo(() => {
    const p = syntheticProspect(industryKey, clamp(team, 1, 500), clamp(locations, 1, 50));
    const guesses = guessStack(p);
    return { sv: savings(p, guesses), lines: guesses.map((g, i): ToolLine => ({ id: `${g.tool}-${i}`, tool: g.tool, category: g.category, monthly_cost: g.monthly_cost, replaced_by: g.replaced_by })) };
  }, [industryKey, team, locations]);
  const suggested = priceBand({ team_size: clamp(team, 1, 500), locations: clamp(locations, 1, 50) });

  const choose = (band: Band) => {
    setChosen(band);
    void track('form_submit', { step: 'choose_plan', band, code: 'W-03', industry: industryKey, team, locations }, {});
    window.requestAnimationFrame(() => checkoutRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
  };
  const latest = useRef({ choose, setIndustryKey, setTeam, setLocations });
  latest.current = { choose, setIndustryKey, setTeam, setLocations };
  useActions('W-03', {
    'site.choosePlan': (p) => { const b = BANDS.find((x) => x === String(p?.band)) ?? suggested; latest.current.choose(b); return `${b} ${money(PRICE_MONTHLY[b])}/mo`; },
    'site.calcSavings': (p) => {
      if (p?.industry && INDUSTRY_KEYS.includes(String(p.industry) as never)) latest.current.setIndustryKey(String(p.industry));
      if (p?.team != null) latest.current.setTeam(clamp(Number(p.team) || 1, 1, 500));
      if (p?.locations != null) latest.current.setLocations(clamp(Number(p.locations) || 1, 1, 50));
      return 'calculator updated';
    },
    'site.checkout': () => 'not wired yet: Stripe checkout (T51)',
  });
  useEffect(() => { void track('view', { code: 'W-03' }, {}); }, []);

  const cols: Column<ToolLine>[] = [
    { key: 'tool', header: t('site.col_tool') },
    { key: 'category', header: t('site.col_category'), render: (r) => <span className="muted">{r.category}</span> },
    { key: 'replaced_by', header: t('site.col_replaced') },
    { key: 'monthly_cost', header: t('site.col_cost'), align: 'right', render: (r) => money(r.monthly_cost) },
  ];

  return (<SiteChrome active="pricing">
    <section className="site-section site-section-top container container-wide stack">
      <span className="eyebrow">{t('site.pricing_eyebrow')}</span>
      <h1 className="site-h1 font-display">{t('site.pricing_h1')}</h1>
      <p className="site-lede">{t('site.pricing_lede')}</p>
      {devMode && <p className="xs site-proposed">{t('site.pricing_proposed')}</p>}
    </section>

    <section className="site-section container container-wide">
      <div className="grid grid-3 site-bands">
        {BANDS.map((b) => (<Card key={b} className={`site-band ${b === suggested ? 'is-suggested' : ''} ${chosen === b ? 'is-chosen' : ''}`}>
          <div className="row wrap"><span className="eyebrow grow">{t(`site.band_${b}`)}</span>{b === suggested && <Badge tone="accent" size="sm">{t('site.band_suggested')}</Badge>}</div>
          <p className="site-band-price font-display">{money(PRICE_MONTHLY[b])}<span className="site-band-per"> / {t('site.month')}</span></p>
          <p className="small muted">{t(`site.band_${b}_who`)}</p>
          <ul className="site-band-list">{['os', 'roles', 'langs', 'devices', 'passes'].map((k) => (<li key={k}>{t(`site.incl_${k}`)}</li>))}</ul>
          <Button block size="lg" variant={b === suggested ? 'accent' : 'outline'} onClick={() => choose(b)} aria-pressed={chosen === b}>{t('site.choose_plan')}</Button>
        </Card>))}
      </div>
    </section>

    <section className="site-section container container-wide stack">
      <h2 className="site-h2 font-display">{t('site.calc_h2')}</h2>
      <p className="small muted">{t('site.calc_sub')}</p>
      <div className="site-calc">
        <Card className="site-calc-form">
          <Field label={t('site.calc_industry')}><Select value={industryKey} onChange={(e) => setIndustryKey(e.target.value)} options={INDUSTRY_KEYS.map((k) => ({ value: k, label: bi(INDUSTRIES[k].label) }))} /></Field>
          <Field label={t('site.calc_team')} hint={t('site.calc_team_hint')}><Input type="number" min={1} max={500} inputMode="numeric" value={String(team)} onChange={(e) => setTeam(clamp(Number(e.target.value) || 1, 1, 500))} /></Field>
          <Field label={t('site.calc_locations')}><Input type="number" min={1} max={50} inputMode="numeric" value={String(locations)} onChange={(e) => setLocations(clamp(Number(e.target.value) || 1, 1, 50))} /></Field>
        </Card>
        <div className="site-calc-out stack">
          <div className="grid grid-2">
            <Stat size="lg" label={t('site.calc_current')} value={money(result.sv.monthly_current)} hint={t('site.per_month')} />
            <Stat size="lg" label={t('site.calc_tools')} value={result.sv.tools_cut} hint={t('site.calc_tools_hint')} />
            <Stat size="lg" tone="accent" label={t('site.calc_ours')} value={money(result.sv.our_price_monthly)} hint={t(`site.band_${result.sv.price_band}`)} />
            <Stat size="lg" tone="success" label={t('site.calc_net')} value={money(result.sv.net_annual)} hint={t('site.per_year')} />
          </div>
          <p className="xs muted">{t('site.calc_note')}</p>
        </div>
      </div>
      <DataTable<ToolLine> caption={t('site.calc_caption')} columns={cols} rows={result.lines} dense empty={{ title: t('site.calc_empty') }} />
    </section>

    <section className="site-section container container-wide" ref={checkoutRef}>
      <h2 className="site-h2 font-display">{t('site.checkout_h2')}</h2>
      <Card className="site-checkout" tone="tint">
        {chosen ? (<>
          <div className="row wrap"><span className="grow"><strong>{t(`site.band_${chosen}`)}</strong> · {money(PRICE_MONTHLY[chosen])} / {t('site.month')}</span><Badge tone="success" size="sm">{t('site.checkout_selected')}</Badge></div>
          <p className="small muted">{t('site.checkout_body')}</p>
          <div className="row wrap">
            <Placeholder will="take payment with Stripe checkout and create the account" by="T51"><Button size="lg" variant="primary" icon="dollar">{t('site.checkout_pay')}</Button></Placeholder>
            <Button size="lg" variant="ghost" icon="calendar" onClick={() => { void track('cta_click', { cta: 'checkout_call', code: 'W-03' }, {}); nav('/site/how'); }}>{t('site.checkout_talk')}</Button>
          </div>
          <p className="xs muted">{t('site.checkout_recorded')}</p>
        </>) : (<>
          <p className="small muted">{t('site.checkout_empty')}</p>
          <Button size="lg" variant="outline" onClick={() => choose(suggested)}>{t('site.checkout_pick', { band: t(`site.band_${suggested}`) })}</Button>
        </>)}
      </Card>
    </section>
  </SiteChrome>);
}
