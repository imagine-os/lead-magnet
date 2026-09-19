import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRow, useTable } from '../../data/DataContext';
import type { PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import { deriveRoleViews, guessStack, industry, savings, type StackGuess } from '../../engine';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { track, trackOnce } from '../../tracking';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { DeviceMockup } from '../../components/molecule/DeviceMockup/DeviceMockup';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useGamepadNav, useSpatialNav } from '../../a11y';
import './proposal.css';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Sections in print order; ids double as tracking keys. */
const SECTIONS = ['cover', 'get', 'savings', 'roles', 'timeline', 'price', 'next'] as const;
/** OS surfaces every prospect gets (string keys resolved per language). */
const SURFACES = ['website', 'app', 'staff', 'docs', 'manual', 'devtools', 'testing'] as const;
/** Phases are bound by dependencies, not calendar days: each one names what it waits for. */
const PHASES = ['intake', 'compose', 'demo', 'walkthrough', 'passes', 'golive'] as const;
interface StackLine { id: string; tool: string; category: string; monthly_cost: number; replaced_by: string; status: string }

export function ProposalPage() {
  const { prospectId } = useParams();
  const { t, bi } = useI18n();
  const { devMode } = useSession();
  const nav = useNavigate();
  const prospect = useRow<ProspectRow>('prospects', prospectId);
  const { rows: storedGuesses } = useTable<StackGuessRow>('stack_guesses', { where: { prospect_id: prospectId } });
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: prospectId } });
  const pageId = pages.find((p) => p.status === 'live')?.id ?? pages[0]?.id ?? null;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const spatial = useSpatialNav(rootRef); useGamepadNav(spatial); // P-04: arrows / d-pad move focus (pass-3 integration)

  const guesses: StackGuess[] = useMemo(() => {
    if (!prospect) return [];
    return storedGuesses.length ? storedGuesses.map((g) => ({ tool: g.tool, category: g.category, monthly_cost: g.monthly_cost, confidence: g.confidence, status: g.status, replaced_by: g.replaced_by })) : guessStack(prospect);
  }, [prospect, storedGuesses]);
  const sv = useMemo(() => (prospect ? savings(prospect, guesses) : null), [prospect, guesses]);
  const roleViews = useMemo(() => (prospect ? deriveRoleViews(prospect) : []), [prospect]);
  const ind = prospect ? industry(prospect.industry) : null;

  const doPrint = () => { void track('cta_click', { cta: 'print', code: 'R-01' }, { prospect_id: prospectId ?? null, page_id: pageId }); window.print(); };
  const goBook = () => { void track('cta_click', { cta: 'book', code: 'R-01' }, { prospect_id: prospectId ?? null, page_id: pageId }); nav(`/book/${prospectId}`); };
  const goDemo = () => { void track('cta_click', { cta: 'demo', code: 'R-01' }, { prospect_id: prospectId ?? null, page_id: pageId }); nav(`/demo/${prospectId}`); };
  useActions('R-01', {
    'proposal.print': () => { doPrint(); return 'print dialog opened'; },
    'proposal.bookCall': () => { goBook(); return `/book/${prospectId}`; },
    'proposal.openDemo': () => { goDemo(); return `/demo/${prospectId}`; },
    'proposal.accept': () => 'not wired yet: e-sign acceptance (later pass)',
  });

  useEffect(() => {
    if (!prospect) return;
    void track('view', { code: 'R-01', prospect: prospect.business_name }, { prospect_id: prospect.id, page_id: pageId });
  }, [prospect, pageId]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) trackOnce(`R-01:${e.target.id}`, 'section_view', { section: e.target.id, code: 'R-01' }, { prospect_id: prospectId ?? null, page_id: pageId });
    }, { threshold: 0.35 });
    for (const id of SECTIONS) { const el = root.querySelector(`#${id}`); if (el) io.observe(el); }
    return () => io.disconnect();
  }, [prospectId, pageId, prospect]);

  if (!prospect || !sv || !ind) {
    return (<div className="pr pr-missing"><main className="container"><EmptyState icon="doc" title={t('proposal.missing')} body={t('proposal.missing_body')} action={<Link to="/"><Button variant="outline" icon="home">{t('proposal.back_hub')}</Button></Link>} /></main></div>);
  }

  const today = new Date().toLocaleDateString(t('proposal.locale'), { year: 'numeric', month: 'long', day: 'numeric' });
  const lines: StackLine[] = guesses.filter((g) => g.status !== 'rejected').map((g, i) => ({ id: `${g.tool}-${i}`, tool: g.tool, category: g.category, monthly_cost: g.monthly_cost, replaced_by: g.replaced_by, status: g.status }));
  const cols: Column<StackLine>[] = [
    { key: 'tool', header: t('proposal.col_tool'), render: (r) => <span className="pr-tool">{r.tool}{r.status === 'confirmed' && <Badge tone="success" size="sm">{t('proposal.confirmed')}</Badge>}</span> },
    { key: 'category', header: t('proposal.col_category'), render: (r) => <span className="muted">{r.category}</span> },
    { key: 'replaced_by', header: t('proposal.col_replaced'), render: (r) => r.replaced_by },
    { key: 'monthly_cost', header: t('proposal.col_cost'), align: 'right', render: (r) => <span className="pr-strike">{money(r.monthly_cost)}</span> },
  ];
  const miniKpis = ind.kpis.slice(0, 3);
  const screen = (variant: 'phone' | 'laptop' | 'tv') => (
    <div className="pr-fit" aria-hidden="true"><div className={`pr-screen pr-screen-${variant}`}>
      <div className="pr-screen-bar"><span className="pr-screen-dot" aria-hidden />{prospect.business_name}<span className="pr-screen-city">{prospect.city}</span></div>
      <div className="pr-screen-kpis">{miniKpis.slice(0, variant === 'phone' ? 1 : 3).map((k) => (<div key={k.sample + bi(k.label)} className="pr-screen-kpi"><span className="pr-screen-kpi-v">{k.sample}</span><span className="pr-screen-kpi-l">{bi(k.label)}</span></div>))}</div>
      <div className="pr-screen-rows">{roleViews.slice(0, 4).map((rv) => (<div key={rv.role} className="pr-screen-row"><span className="pr-screen-role">{cap(rv.role)}</span><span className="pr-screen-row-x">{bi(rv.widgets[1]?.title ?? rv.widgets[0].title)}</span></div>))}</div>
      <div className="pr-screen-chart" aria-hidden>{[38, 52, 44, 61, 57, 72, 66].map((b, i) => <span key={i} className="pr-screen-col" style={{ height: `${b}%` }} />)}</div>
    </div></div>);

  return (
    <div className="pr" ref={rootRef} style={prospectStyle(prospect.style.palette, prospect.style.font)}>
      <div className="pr-toolbar pr-noprint container container-wide">
        <span className="pr-wordmark">Imagine</span>
        <div className="row wrap">
          <LangToggle />
          <Button size="sm" variant="outline" icon="doc" onClick={doPrint}>{t('proposal.print')}</Button>
        </div>
      </div>

      <main className="pr-doc container">
        <section id="cover" className="pr-section pr-cover">
          <div className="pr-cover-rule" aria-hidden />
          <p className="eyebrow pr-eyebrow">{t('proposal.eyebrow')}</p>
          <h1 className="pr-h1 font-display">{t('proposal.cover_h1', { business: prospect.business_name })}</h1>
          <p className="pr-lede">{t('proposal.cover_lede', { business: prospect.business_name, city: prospect.city, industry: bi(ind.label).toLowerCase() })}</p>
          <dl className="pr-meta">
            <div><dt>{t('proposal.prepared_for')}</dt><dd>{prospect.first_name} {prospect.last_name}</dd></div>
            <div><dt>{t('proposal.prepared_by')}</dt><dd>Imagine</dd></div>
            <div><dt>{t('proposal.date')}</dt><dd>{today}</dd></div>
            <div><dt>{t('proposal.band')}</dt><dd>{t(`proposal.band_${sv.price_band}`)}</dd></div>
          </dl>
        </section>

        <section id="get" className="pr-section">
          <h2 className="pr-h2 font-display">{t('proposal.get_h2')}</h2>
          <p className="pr-sub">{t('proposal.get_sub', { business: prospect.business_name })}</p>
          <div className="pr-devices">
            <DeviceMockup kind="phone" title={t('proposal.device_phone', { business: prospect.business_name })}>{screen('phone')}</DeviceMockup>
            <DeviceMockup kind="laptop" title={t('proposal.device_laptop', { business: prospect.business_name })}>{screen('laptop')}</DeviceMockup>
            <DeviceMockup kind="tv" title={t('proposal.device_tv', { business: prospect.business_name })}>{screen('tv')}</DeviceMockup>
          </div>
          <ul className="pr-surfaces">
            {SURFACES.map((s) => (<li key={s}><Card padding="sm" className="pr-surface"><span className="pr-surface-name">{t(`proposal.surface_${s}`)}</span><span className="pr-surface-body xs muted">{t(`proposal.surface_${s}_body`, { business: prospect.business_name })}</span></Card></li>))}
          </ul>
        </section>

        <section id="savings" className="pr-section">
          <h2 className="pr-h2 font-display">{t('proposal.savings_h2')}</h2>
          <p className="pr-sub">{t('proposal.savings_sub', { business: prospect.business_name, tools: sv.tools_cut })}</p>
          <div className="pr-stats grid grid-4">
            <Stat label={t('proposal.stat_today')} value={money(sv.monthly_current)} hint={t('proposal.per_month')} />
            <Stat label={t('proposal.stat_tools')} value={sv.tools_cut} hint={t('proposal.stat_tools_hint')} />
            <Stat label={t('proposal.stat_ours')} value={money(sv.our_price_monthly)} hint={t(`proposal.band_${sv.price_band}`)} tone="accent" />
            <Stat label={t('proposal.stat_net')} value={money(sv.net_annual)} hint={t('proposal.per_year')} tone="success" />
          </div>
          <DataTable<StackLine> caption={t('proposal.table_caption', { business: prospect.business_name })} columns={cols} rows={lines} />
          <p className="xs muted">{t('proposal.savings_note', { annual: money(sv.annual_current), net: money(sv.net_monthly) })}</p>
        </section>

        <section id="roles" className="pr-section">
          <h2 className="pr-h2 font-display">{t('proposal.roles_h2')}</h2>
          <p className="pr-sub">{t('proposal.roles_sub')}</p>
          <div className="pr-roles">
            {roleViews.map((rv) => (<Card key={`${rv.kind}-${rv.role}`} padding="sm" className="pr-role">
              <div className="row"><span className="pr-role-name">{cap(rv.role)}</span><Badge size="sm" tone={rv.kind === 'business' ? 'primary' : 'accent'}>{t(`proposal.role_${rv.kind}`)}</Badge></div>
              <p className="xs muted pr-role-line">{t('proposal.role_line', { widgets: rv.widgets.map((w) => bi(w.title)).join(' · ') })}</p>
            </Card>))}
          </div>
        </section>

        <section id="timeline" className="pr-section">
          <h2 className="pr-h2 font-display">{t('proposal.timeline_h2')}</h2>
          <p className="pr-sub">{t('proposal.timeline_sub')}</p>
          <ol className="pr-phases">
            {PHASES.map((ph, i) => (<li key={ph} className="pr-phase">
              <span className="pr-phase-n" aria-hidden>{i + 1}</span>
              <div><div className="pr-phase-t">{t(`proposal.phase_${ph}`)}</div><p className="xs muted">{t(`proposal.phase_${ph}_body`, { business: prospect.business_name })}</p><p className="xs pr-phase-dep">{i === 0 ? t('proposal.phase_dep_none') : t('proposal.phase_dep', { prev: t(`proposal.phase_${PHASES[i - 1]}`) })}</p></div>
            </li>))}
          </ol>
        </section>

        <section id="price" className="pr-section">
          <h2 className="pr-h2 font-display">{t('proposal.price_h2')}</h2>
          <Card className="pr-price">
            <div className="pr-price-head"><div><div className="pr-price-band">{t(`proposal.band_${sv.price_band}`)}</div><div className="pr-price-why xs muted">{t('proposal.price_why', { team: prospect.team_size, locations: prospect.locations })}</div></div>
              <div className="pr-price-amount font-display">{money(sv.our_price_monthly)}<span className="pr-price-per"> / {t('proposal.month')}</span></div></div>
            <ul className="pr-included">{['os', 'roles', 'brand', 'langs', 'devices', 'support'].map((k) => (<li key={k}>{t(`proposal.incl_${k}`)}</li>))}</ul>
            <p className="xs muted">{t('proposal.price_compare', { current: money(sv.monthly_current), net: money(sv.net_monthly) })}</p>
            {devMode && <p className="xs pr-proposed">{t('proposal.price_proposed')}</p>}
          </Card>
        </section>

        <section id="next" className="pr-section">
          <h2 className="pr-h2 font-display">{t('proposal.next_h2')}</h2>
          <p className="pr-sub">{t('proposal.next_sub')}</p>
          <ol className="pr-next">
            <li>{t('proposal.next_1')}</li><li>{t('proposal.next_2')}</li><li>{t('proposal.next_3')}</li>
          </ol>
          <div className="pr-cta row wrap pr-noprint">
            <Link to={`/book/${prospect.id}`} onClick={() => void track('cta_click', { cta: 'book', code: 'R-01' }, { prospect_id: prospect.id, page_id: pageId })}><Button size="lg" variant="accent" icon="calendar">{t('proposal.book')}</Button></Link>
            <Placeholder will="send this proposal for e-signature and record the acceptance" by="later pass"><Button size="lg" variant="primary" icon="check">{t('proposal.accept')}</Button></Placeholder>
            <Button size="lg" variant="outline" icon="doc" onClick={doPrint}>{t('proposal.print')}</Button>
            <Link to={`/demo/${prospect.id}`} onClick={() => void track('cta_click', { cta: 'demo', code: 'R-01' }, { prospect_id: prospect.id, page_id: pageId })}><Button size="lg" variant="ghost" icon="play">{t('proposal.open_demo')}</Button></Link>
          </div>
          <p className="pr-signature">{t('proposal.signature')}</p>
        </section>
      </main>
      <footer className="pr-foot container"><span className="pr-wordmark">Imagine</span><span className="xs muted">{t('proposal.foot', { business: prospect.business_name, date: today })}</span></footer>
    </div>
  );
}
