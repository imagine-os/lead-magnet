import { useState } from 'react';
import { getRoutes } from '../../app/registry';
import { useActions } from '../../actions';
import { ViewportFrame } from '../../components/molecule/ViewportFrame/ViewportFrame';
import { Select } from '../../components/atom/Select/Select';
import { Chip } from '../../components/atom/Chip/Chip';
import { Field } from '../../components/molecule/Field/Field';
export const QA_WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];
export const fillParams = (path: string) => path.replace(':slug', 'paws-and-play-austin').replace(':prospectId', 'pro_maya').replace(':id', 'pro_maya').replace(':role', 'owner').replace(':table', 'prospects').replace(':code', 'HUB-01');
export function QaPreviewPage() {
  const [route, setRoute] = useState('/'); const [widths, setWidths] = useState<number[]>([360, 390, 768, 1280]);
  useActions('D-08', { 'dev.previewRoute': (p) => setRoute(String(p?.route ?? '/')) });
  const routes = getRoutes().filter((r) => r.path !== '/dev/qa').sort((a, b) => a.spec.code.localeCompare(b.spec.code));
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-08 · QA preview</h1><span className="xs muted">phone to 4K TV: 360, 390, 768, 1280, 1920, 2560, 3840</span></div>
    <div className="row wrap" style={{ alignItems: 'flex-end' }}><Field label="Route"><Select value={route} onChange={(e) => setRoute(e.target.value)} options={routes.map((r) => ({ value: fillParams(r.path), label: `${r.spec.code} · ${r.spec.name}` }))} /></Field><div className="row wrap">{QA_WIDTHS.map((w) => <Chip key={w} selected={widths.includes(w)} onClick={() => setWidths((l) => (l.includes(w) ? l.filter((x) => x !== w) : [...l, w].sort((a, b) => a - b)))}>{w}</Chip>)}</div></div>
    <div className="grid grid-2">{widths.map((w) => <ViewportFrame key={`${route}-${w}`} route={route} width={w} height={w < 600 ? 844 : w >= 1920 ? Math.round(w * 9 / 16) : 900} label={`${route} @ ${w}`} />)}</div>
  </div>);
}
