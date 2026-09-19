import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import type { RouteDef, Surface } from '../../../specs/types';
import { useSession } from '../../../auth/SessionProvider';
import { navGroup } from '../../../app/navGroups';
import { Sidebar, type SidebarGroup } from '../../organism/Sidebar/Sidebar';
import { TopBar } from '../../organism/TopBar/TopBar';
import { FeedbackButton } from '../../organism/FeedbackButton/FeedbackButton';
import { IconButton } from '../../atom/IconButton/IconButton';
import { useGamepadNav, useSpatialNav } from '../../../a11y';
import type { IconName } from '../../atom/Icon/Icon';
import './DesktopShell.css';
export interface DesktopShellProps { surfaces: Surface[]; routes: RouteDef[]; title: string; children: ReactNode; feedback?: boolean }
function useNarrow(bp = 900) { const [n, set] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${bp}px)`).matches : false)); useEffect(() => { const mq = window.matchMedia(`(max-width: ${bp}px)`); const h = () => set(mq.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, [bp]); return n; }
/** Studio / admin / plan / dev / docs / manual shell: 256 px sidebar (drawer under 900), top bar, content, FeedbackButton. Arrow keys / a gamepad d-pad move focus across sidebar, top bar and content (T47, P-04); Escape / Backspace close the drawer or go one hash level up. */
export function DesktopShell({ surfaces, routes, title, children, feedback = true }: DesktopShellProps) {
  const { hasRole, devMode } = useSession(); const { pathname } = useLocation(); const narrow = useNarrow(); const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [pathname]);
  const root = useRef<HTMLDivElement>(null); const spatial = useSpatialNav(root, { onBack: drawer ? () => setDrawer(false) : undefined }); useGamepadNav(spatial); // P-04: the whole shell is one focus grid so the sidebar is reachable from the content with Left
  const groups = useMemo<SidebarGroup[]>(() => {
    const byKey = new Map<string, SidebarGroup & { order: number; ord: number[] }>();
    for (const r of routes) {
      if (!r.nav || !surfaces.includes(r.surface) || !hasRole(r.roles)) continue;
      const g = navGroup(r.nav.group);
      if (!byKey.has(g.key)) byKey.set(g.key, { key: g.key, label: g.label, icon: g.icon, items: [], order: g.order, ord: [] });
      const grp = byKey.get(g.key)!; grp.items.push({ to: r.nav.to ?? r.path, label: r.nav.label, icon: r.nav.icon as IconName, code: r.spec.code, end: ['/studio', '/admin', '/dev', '/plan', '/docs', '/manual'].includes(r.path) }); grp.ord.push(r.nav.order);
    }
    return [...byKey.values()].sort((a, b) => a.order - b.order).map((g) => ({ key: g.key, label: g.label, icon: g.icon, items: g.items.map((it, i) => ({ it, o: g.ord[i] })).sort((a, b) => a.o - b.o).map((x) => x.it) }));
  }, [routes, surfaces, hasRole]);
  const current = routes.find((r) => matchPath({ path: r.path, end: true }, pathname));
  const header = <Link to="/" className="shell-brand" title="Lead Magnet · testing hub"><span className="shell-mark" aria-hidden>LM</span><span className="shell-brandname">Lead Magnet</span><span className="xs faint">{title}</span></Link>;
  const sidebar = <Sidebar groups={groups} header={header} showCodes={devMode} onNavigate={() => setDrawer(false)} footer={<Link to="/" className="shell-hublink">Hub</Link>} />;
  return (<div data-component="DesktopShell" className="shell" ref={root}>
    {!narrow && <div className="shell-side">{sidebar}</div>}
    {narrow && drawer && <div className="shell-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}><div className="shell-overlay-panel">{sidebar}<IconButton icon="close" label="Close menu" className="shell-overlay-close" variant="outline" onClick={() => setDrawer(false)} /></div></div>}
    <div className="shell-main"><TopBar title={title} onMenu={narrow ? () => setDrawer(true) : undefined} /><main className="shell-content" id="main">{children}</main></div>
    {feedback && current && <FeedbackButton pageCode={current.spec.code} route={current.path} />}
  </div>);
}
