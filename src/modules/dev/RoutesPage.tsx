import { useState } from 'react';
import { getRoutes, routeStatus } from '../../app/registry';
import { specCompleteness, SURFACE_LABEL, type Surface } from '../../specs/types';
import { useActions } from '../../actions';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Chip } from '../../components/atom/Chip/Chip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Stat } from '../../components/molecule/Stat/Stat';
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
export function RoutesPage() {
  const [surface, setSurface] = useState<Surface | 'all'>('all'); const [status, setStatus] = useState<'all' | 'built' | 'stub'>('all');
  const routes = getRoutes(); const built = routes.filter((r) => routeStatus(r) === 'built').length;
  useActions('D-01', { 'dev.filterRoutes': (p) => setSurface((p?.surface as Surface) ?? 'all') });
  const rows = routes.filter((r) => (surface === 'all' || r.surface === surface) && (status === 'all' || routeStatus(r) === status)).map((r) => ({ id: r.path, code: r.spec.code, name: r.spec.name, path: r.path, surface: r.surface, status: routeStatus(r), roles: r.roles.join(', '), completeness: specCompleteness(r.spec).score, actions: r.spec.actions.length })).sort((a, b) => a.code.localeCompare(b.code));
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-01 · Routes manifest</h1><span className="xs muted">window.__leadmagnet.routes</span></div>
    <div className="grid grid-4"><Stat label="Routes" value={routes.length} /><Stat label="Built" value={built} tone="success" /><Stat label="Stubs" value={routes.length - built} tone="warn" /><Stat label="Actions" value={routes.reduce((s, r) => s + r.spec.actions.length, 0)} /></div>
    <div className="row wrap"><Chip selected={surface === 'all'} onClick={() => setSurface('all')}>all</Chip>{(Object.keys(SURFACE_LABEL) as Surface[]).map((s) => <Chip key={s} selected={surface === s} onClick={() => setSurface(s)}>{SURFACE_LABEL[s]}</Chip>)}<span className="faint">|</span>{(['all', 'built', 'stub'] as const).map((s) => <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}</div>
    <DataTable caption="Routes" rows={rows} rowHref={(r) => r.path.replace(':slug', 'paws-and-play-austin').replace(':prospectId', 'pro_maya').replace(':id', 'pro_maya').replace(':role', 'owner').replace(':table', 'prospects').replace(':code', 'HUB-01')} columns={[{ key: 'code', header: 'Code', render: (r) => <code>{r.code}</code> }, { key: 'name', header: 'Name' }, { key: 'path', header: 'Path', render: (r) => <code className="xs">{r.path}</code> }, { key: 'surface', header: 'Surface' }, { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} size="sm">{r.status}</Badge> }, { key: 'roles', header: 'Roles', hideOnCard: true }, { key: 'completeness', header: 'Spec', render: (r) => <ProgressBar value={r.completeness} label="Spec" size="sm" showValue /> }, { key: 'actions', header: 'Actions', align: 'right' }]} />
  </div>);
}
