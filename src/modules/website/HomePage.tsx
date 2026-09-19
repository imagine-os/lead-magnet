import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import { PRICE_MONTHLY, industry, savings, type StackGuess } from '../../engine';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { track } from '../../tracking';
import { SiteChrome } from './SiteChrome';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { DeviceMockup } from '../../components/molecule/DeviceMockup/DeviceMockup';
import { PhoneFrame } from '../../components/organism/PhoneFrame/PhoneFrame';
import { SamplePreview } from './SamplePreview';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
/** Same-origin hash route for an iframe inside a device frame. */
const appUrl = (hash: string) => `${window.location.pathname}${window.location.search}#${hash}`;
interface Sample { prospect: ProspectRow; page: PageRow; netAnnual: number; toolsCut: number }

export function HomePage() {
  const { t, bi } = useI18n();
  const nav = useNavigate();
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const { rows: pages } = useTable<PageRow>('pages');
  const { rows: guesses } = useTable<StackGuessRow>('stack_guesses');

  /** R-W02: a sample only exists when it has a real page row to open. */
  const samples: Sample[] = useMemo(() => prospects.flatMap((prospect) => {
    const page = pages.find((x) => x.prospect_id === prospect.id);
    if (!page) return [];
    const mine: StackGuess[] = guesses.filter((g) => g.prospect_id === prospect.id).map((g) => ({ tool: g.tool, category: g.category, monthly_cost: g.monthly_cost, confidence: g.confidence, status: g.status, replaced_by: g.replaced_by }));
    const sv = savings(prospect, mine);
    return [{ prospect, page, netAnnual: sv.net_annual, toolsCut: sv.tools_cut }];
  }), [prospects, pages, guesses]);

  const [activeId, setActiveId] = useState<string>('');
  const active = samples.find((s) => s.prospect.id === activeId) ?? samples[0];
  const latest = useRef<{ samples: Sample[]; active?: Sample }>({ samples, active });
  latest.current = { samples, active };
  const avgNet = samples.length ? Math.round(samples.reduce((s, x) => s + x.netAnnual, 0) / samples.length) : 0;
  const avgTools = samples.length ? Math.round(samples.reduce((s, x) => s + x.toolsCut, 0) / samples.length) : 0;

  const pick = (param?: unknown): Sample | undefined => {
    const all = latest.current.samples;
    const key = String(param ?? '').toLowerCase();
    return all.find((s) => s.prospect.id === key || s.page.slug === key || s.prospect.business_name.toLowerCase() === key) ?? latest.current.active;
  };
  useActions('W-01', {
    'site.showSample': (p) => { const s = pick(p?.sample); if (s) setActiveId(s.prospect.id); return s?.prospect.business_name ?? 'no samples'; },
    'site.seeSample': (p) => { const s = pick(p?.sample); if (!s) return 'no samples'; nav(`/p/${s.page.slug}`); return `/p/${s.page.slug}`; },
    'site.openDemo': (p) => { const s = pick(p?.sample); if (!s) return 'no samples'; nav(`/demo/${s.prospect.id}`); return `/demo/${s.prospect.id}`; },
    'site.startPurchase': () => { nav('/site/pricing'); return '/site/pricing'; },
  });
  useEffect(() => { void track('view', { code: 'W-01' }, {}); }, []);
  const cta = (cta: string, to: string) => () => { void track('cta_click', { cta, code: 'W-01' }, {}); nav(to); };

  const steps: { icon: IconName; k: string }[] = [{ icon: 'search', k: 'learn' }, { icon: 'wand', k: 'build' }, { icon: 'dollar', k: 'cut' }];
  const bands = (['starter', 'team', 'multi'] as const);

  return (<SiteChrome active="home">
    <section className="site-hero">
      <div className="container container-wide site-hero-in">
        <div className="site-hero-copy stack">
          <span className="eyebrow">{t('site.hero_eyebrow')}</span>
          <h1 className="site-h1 font-display">{t('site.h1')}</h1>
          <p className="site-lede">{t('site.hero_lede')}</p>
          <div className="row wrap">
            <Button size="lg" variant="accent" iconRight="arrow-right" onClick={cta('get_yours_hero', '/site/pricing')}>{t('site.get_yours')}</Button>
            {active && <Button size="lg" variant="outline" icon="eye" onClick={cta('see_sample_hero', `/p/${active.page.slug}`)}>{t('site.see_sample')}</Button>}
          </div>
          <p className="xs muted">{t('site.hero_note')}</p>
        </div>
        <div className="site-hero-devices">
          {samples.length > 1 && <SegmentedControl label={t('site.sample_switch')} value={active?.prospect.id ?? ''} onChange={(v) => { setActiveId(v); void track('cta_click', { cta: 'switch_sample', sample: v, code: 'W-01' }, {}); }} options={samples.map((s) => ({ value: s.prospect.id, label: s.prospect.business_name }))} />}
          {active && (<>
            <div className="site-devices">
              <div className="site-device-phone">
                <PhoneFrame src={appUrl(`/p/${active.page.slug}`)} scale={0.34} title={t('site.device_phone', { business: active.prospect.business_name })} />
                <Badge tone="success" size="sm">{t('site.device_live')}</Badge>
              </div>
              <DeviceMockup kind="laptop" title={t('site.device_laptop', { business: active.prospect.business_name })}><SamplePreview prospect={active.prospect} variant="laptop" /></DeviceMockup>
              <DeviceMockup kind="tv" title={t('site.device_tv', { business: active.prospect.business_name })}><SamplePreview prospect={active.prospect} variant="tv" /></DeviceMockup>
            </div>
            <p className="xs muted site-devices-cap">{t('site.device_cap', { business: active.prospect.business_name, city: active.prospect.city })} · <Link to={`/p/${active.page.slug}`}>{t('site.their_page')}</Link> · <Link to={`/demo/${active.prospect.id}`}>{t('site.their_demo')}</Link></p>
          </>)}
        </div>
      </div>
    </section>

    <section className="site-section container container-wide">
      <h2 className="site-h2 font-display">{t('site.promise_h2')}</h2>
      <div className="grid grid-3 site-steps">
        {steps.map((s, i) => (<Card key={s.k} className="site-step">
          <span className="site-step-icon"><Icon name={s.icon} /></span>
          <span className="eyebrow">{t('site.step_n', { n: i + 1 })}</span>
          <h3 className="site-h3">{t(`site.step_${s.k}`)}</h3>
          <p className="small muted">{t(`site.step_${s.k}_body`)}</p>
        </Card>))}
      </div>
    </section>

    <section className="site-section site-proof">
      <div className="container container-wide stack">
        <h2 className="site-h2 font-display">{t('site.proof_h2')}</h2>
        <p className="site-lede-sm muted">{t('site.proof_sub', { n: samples.length })}</p>
        <div className="grid grid-3">
          <Stat size="lg" tone="success" label={t('site.proof_avg')} value={money(avgNet)} hint={t('site.per_year')} />
          <Stat size="lg" tone="accent" label={t('site.proof_tools')} value={avgTools} hint={t('site.proof_tools_hint')} />
          <Stat size="lg" label={t('site.proof_systems')} value={samples.length} hint={t('site.proof_systems_hint')} />
        </div>
      </div>
    </section>

    <section className="site-section container container-wide">
      <div className="page-head"><h2 className="site-h2 font-display">{t('site.samples_h2')}</h2><span className="xs muted">{t('site.samples_sub')}</span></div>
      <div className="grid grid-3 site-samples">
        {samples.map((s) => (<Card key={s.prospect.id} interactive className="site-sample" style={{ ['--lp-primary' as string]: s.prospect.style.palette.primary, ['--lp-accent' as string]: s.prospect.style.palette.accent }}>
          <span className="site-sample-band" aria-hidden />
          <div className="row"><h3 className="site-h3 grow"><Link to={`/p/${s.page.slug}`} onClick={() => void track('cta_click', { cta: 'sample', sample: s.page.slug, code: 'W-01' }, {})}>{s.prospect.business_name}</Link></h3><Badge size="sm" status={s.page.status}>{s.page.status}</Badge></div>
          <p className="xs muted">{bi(industry(s.prospect.industry).label)} · {s.prospect.city} · {t('site.team_n', { n: s.prospect.team_size })}</p>
          <p className="site-sample-save"><span className="font-display">{money(s.netAnnual)}</span> <span className="xs muted">{t('site.saved_year')}</span></p>
          <div className="row wrap">
            <Link to={`/p/${s.page.slug}`}><Button size="sm" variant="outline" icon="eye">{t('site.their_page')}</Button></Link>
            <Link to={`/demo/${s.prospect.id}`}><Button size="sm" variant="ghost" icon="play">{t('site.their_demo')}</Button></Link>
            <Link to={`/proposal/${s.prospect.id}`}><Button size="sm" variant="ghost" icon="doc">{t('site.their_proposal')}</Button></Link>
          </div>
        </Card>))}
      </div>
    </section>

    <section className="site-section container container-wide">
      <div className="page-head"><h2 className="site-h2 font-display">{t('site.pricing_h2')}</h2><Link to="/site/pricing" className="small">{t('site.pricing_all')}</Link></div>
      <div className="grid grid-3">
        {bands.map((b) => (<Card key={b} className="site-band-mini">
          <span className="eyebrow">{t(`site.band_${b}`)}</span>
          <p className="site-band-price font-display">{money(PRICE_MONTHLY[b])}<span className="site-band-per"> / {t('site.month')}</span></p>
          <p className="xs muted">{t(`site.band_${b}_who`)}</p>
        </Card>))}
      </div>
      <p className="xs muted">{t('site.pricing_teaser_note')}</p>
    </section>

    <section className="site-cta">
      <div className="container container-wide site-cta-in">
        <div className="stack-sm"><h2 className="site-h2 font-display">{t('site.cta_h2')}</h2><p className="site-lede-sm">{t('site.cta_sub')}</p></div>
        <Button size="lg" variant="accent" iconRight="arrow-right" onClick={cta('get_yours_band', '/site/pricing')}>{t('site.get_yours')}</Button>
      </div>
    </section>
  </SiteChrome>);
}
