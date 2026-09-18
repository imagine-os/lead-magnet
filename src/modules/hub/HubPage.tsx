import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { ROLE_HOME, ROLE_LABEL, ROLES } from '../../auth/roles';
import { useTheme } from '../../design/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { useData, useTable } from '../../data/DataContext';
import type { PageRow, ProspectRow, StackGuessRow, TaskRow } from '../../data/schema/core';
import { savings } from '../../engine';
import { getRoutes, routeStatus } from '../../app/registry';
import { tables } from '../../data/schema';
import { rules } from '../../rules';
import { componentLibrary } from '../../design/library';
import { useActions } from '../../actions';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { RoleSwitcher } from '../../components/molecule/RoleSwitcher/RoleSwitcher';
import { PhoneFrame } from '../../components/organism/PhoneFrame/PhoneFrame';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Button } from '../../components/atom/Button/Button';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { useToast } from '../../components/molecule/Toast/Toast';
import './hub.css';

const ARCH: Record<string, { label: string; path: (slug: string) => string }> = { reveal: { label: 'A · Reveal', path: (s) => `/p/${s}` }, audit: { label: 'B · Audit', path: (s) => `/p/${s}/audit` }, walkthrough: { label: 'C · Walkthrough', path: (s) => `/p/${s}/story` }, letter: { label: 'D · Letter', path: (s) => `/p/${s}/letter` } };

export function HubPage() {
  const { isSuperAdmin, devMode, setDevMode, switchUser, hasRole } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate(); const data = useData(); const toast = useToast();
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const { rows: pages } = useTable<PageRow>('pages');
  const { rows: guesses } = useTable<StackGuessRow>('stack_guesses');
  const { rows: tasks } = useTable<TaskRow>('tasks');
  const routes = getRoutes();
  const built = routes.filter((r) => routeStatus(r) === 'built').length;
  const done = tasks.filter((x) => x.status === 'done').length;
  useActions('HUB-01', { 'hub.setLang': (p) => setLang((p?.lang as 'en' | 'es') ?? 'en'), 'hub.toggleTheme': () => toggleTheme(), 'hub.toggleDevMode': () => setDevMode(!devMode), 'hub.switchUser': (p) => switchUser(String(p?.role ?? 'guest')), 'hub.openSurface': (p) => nav(String(p?.surface ?? '/')), 'hub.resetDemoData': () => data.reset?.() });
  const firstProspect = prospects[0];
  const surfaces: { to: string; icon: IconName; title: string; body: string; code: string }[] = [
    { to: '/studio', icon: 'sparkles', title: t('hub.studio'), body: t('hub.studio_body'), code: 'S-01' }, { to: '/admin', icon: 'chart', title: t('hub.admin'), body: t('hub.admin_body'), code: 'A-01' }, { to: '/plan', icon: 'kanban', title: t('hub.plan'), body: t('hub.plan_body'), code: 'K-01' },
    { to: firstProspect ? `/proposal/${firstProspect.id}` : '/proposal/x', icon: 'doc', title: t('hub.proposal'), body: t('hub.proposal_body'), code: 'R-01' }, { to: '/site', icon: 'globe', title: t('hub.site'), body: t('hub.site_body'), code: 'W-01' }, { to: '/docs', icon: 'book', title: t('hub.docs'), body: t('hub.docs_body'), code: 'D-06' }, { to: '/manual', icon: 'book', title: t('hub.manual'), body: t('hub.manual_body'), code: 'M-01' },
  ];
  const devLinks = routes.filter((r) => r.surface === 'dev' && !r.path.includes(':')).sort((a, b) => a.spec.code.localeCompare(b.spec.code));
  return (<div className="hub">
    <header className="hub-head container container-wide">
      <div className="hub-brand"><span className="shell-mark" aria-hidden>LM</span><div><div className="hub-title font-display">Lead Magnet</div><div className="xs muted">{t('hub.tagline')} · v{__APP_VERSION__}</div></div></div>
      <div className="row wrap hub-controls">
        <LangToggle />
        <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? t('hub.light') : t('hub.dark')} variant="outline" onClick={toggleTheme} />
        {isSuperAdmin && <Toggle checked={devMode} onChange={setDevMode} label={t('hub.devmode')} />}
      </div>
    </header>
    <main className="container container-wide hub-main">
      <section className="hub-hero"><div className="stack"><h1 className="hub-h1 font-display">{t('hub.h1')}</h1><p className="muted md">{t('hub.h1_body')}</p><RoleSwitcher /><div className="row wrap">{ROLES.map((r) => <Button key={r} size="sm" variant="outline" onClick={() => { switchUser(r); nav(ROLE_HOME[r]); }}>{ROLE_LABEL[r]}</Button>)}</div></div>
        <div className="hub-phone">{firstProspect && <PhoneFrame src={`${window.location.pathname}${window.location.search}#/demo/${firstProspect.id}`} scale={0.42} title={`${firstProspect.business_name} OS demo`} />}<div className="xs muted hub-phone-cap">{t('hub.phone_cap')} · <Link to={firstProspect ? `/demo/${firstProspect.id}` : '/'}>C-01</Link></div></div>
      </section>

      <section className="stack"><div className="page-head"><h2>{t('hub.prospects')}</h2><span className="xs muted">{t('hub.prospects_body')}</span></div>
        <div className="grid grid-3">{prospects.map((p) => { const page = pages.find((x) => x.prospect_id === p.id); const mine = guesses.filter((g) => g.prospect_id === p.id); const net = mine.length ? savings(p, mine).net_annual : null; return (
          <Card key={p.id} className="hub-prospect" style={{ ['--lp-primary' as string]: p.style.palette.primary, ['--lp-accent' as string]: p.style.palette.accent }}>
            <div className="hub-prospect-band" aria-hidden />
            <div className="row"><Avatar name={`${p.first_name} ${p.last_name}`} color={p.style.palette.primary} /><div className="grow"><div className="hub-prospect-name">{p.business_name}</div><div className="xs muted">{p.first_name} · {p.city} · {p.industry.replace('_', ' ')} · <span lang={p.lang}>{p.lang.toUpperCase()}</span></div></div><Badge tone={p.warmth === 'hot' ? 'danger' : p.warmth === 'warm' ? 'warn' : 'info'} size="sm">{p.warmth}</Badge></div>
            {net != null && <div className="hub-prospect-savings"><span className="font-display">${Math.round(net).toLocaleString()}</span> <span className="xs muted">{t('hub.savings_yr')}</span></div>}
            <div className="row wrap xs">{Object.entries(ARCH).map(([k, a]) => <Link key={k} to={a.path(page?.slug ?? p.id)} className={`hub-arch ${page?.archetype === k ? 'is-live' : ''}`}>{a.label}{page?.archetype === k && <Badge status="live" size="sm">live</Badge>}</Link>)}</div>
            <div className="row wrap"><Link to={`/demo/${p.id}`}><Button size="sm" variant="primary" icon="phone">{t('hub.open_demo')}</Button></Link><Link to={`/studio/prospects/${p.id}`}><Button size="sm" variant="ghost" icon="edit">{t('hub.studio')}</Button></Link><Link to={`/book/${p.id}`}><Button size="sm" variant="ghost" icon="calendar">B-01</Button></Link></div>
          </Card>); })}</div>
      </section>

      <section className="stack"><h2>{t('hub.surfaces')}</h2>
        <div className="grid grid-auto">{surfaces.map((s) => { const r = routes.find((x) => x.spec.code === s.code); const ok = !r || hasRole(r.roles); return (<Card key={s.code} interactive className="hub-surface" tone={ok ? 'surface' : 'tint'}>
          <Link to={s.to} className="hub-surface-link"><div className="row"><span className="hub-surface-icon"><Icon name={s.icon} /></span><div className="grow"><div className="hub-surface-title">{s.title}</div><div className="xs muted">{s.body}</div></div></div><div className="row wrap xs"><Badge tone="primary" size="sm">{s.code}</Badge>{r && <Badge status={routeStatus(r)} size="sm">{routeStatus(r)}</Badge>}{!ok && <Badge size="sm" tone="warn">{t('hub.needs_role')}</Badge>}</div></Link></Card>); })}</div>
      </section>

      <section className="stack"><div className="page-head"><h2>{t('hub.dev')}</h2><span className="xs muted">{t('hub.dev_body')}</span></div>
        <div className="grid grid-auto-sm">{devLinks.map((r) => <Card key={r.path} interactive padding="sm"><Link to={r.path} className="hub-dev-link"><code className="hub-dev-code">{r.spec.code}</code><span className="hub-dev-name">{r.spec.name}</span></Link></Card>)}</div>
        {isSuperAdmin && <div className="row wrap"><Button variant="outline" size="sm" icon="refresh" onClick={async () => { await data.reset?.(); toast.push({ tone: 'success', title: t('hub.reset_done') }); }}>{t('hub.reset')}</Button></div>}
      </section>
    </main>
    <footer className="hub-foot container container-wide"><div className="grid grid-4 hub-counts"><Stat label={t('hub.routes')} value={routes.length} hint={`${built} ${t('hub.built')} · ${routes.length - built} ${t('hub.stubs')}`} /><Stat label={t('hub.tables')} value={tables.length} hint={`${rules.length} ${t('hub.rules')}`} /><Stat label={t('hub.components')} value={componentLibrary.length} /><Stat label={t('hub.plan_progress')} value={`${done} / ${tasks.length}`} hint={t('hub.tasks_done')} /></div><p className="xs muted">{lang === 'es' ? 'Hecho por Imagine.' : 'Made by Imagine.'} <a href="https://github.com/imagine-os/lead-magnet">GitHub</a> · <Link to="/docs">Docs</Link></p></footer>
  </div>);
}
