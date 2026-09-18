import { Link } from 'react-router-dom';
import type { PageSpec } from '../../../specs/types';
import { surfaceOfCode } from '../../../specs/types';
import { useSession } from '../../../auth/SessionProvider';
import { rulesForPage } from '../../../rules';
import { Card } from '../../molecule/Card/Card';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Placeholder } from '../../atom/Placeholder/Placeholder';
import { openInspector } from '../../../dev/inspectorBus';
import './PageStub.css';
/** Placeholder page for a code that is specified but not built yet. Module agents replace it by registering a real route at the same path. */
export function PageStub({ spec }: { spec: PageSpec }) {
  const { devMode } = useSession();
  const rules = rulesForPage(spec.code);
  const by = spec.notes?.find((n) => n.startsWith('Built by')) ?? '';
  return (<div className="container page"><Card className="stub" padding="lg">
    <div className="row wrap"><code className="stub-code">{spec.code}</code><Badge status="stub">Coming soon</Badge><span className="xs faint">{surfaceOfCode(spec.code)}</span></div>
    <h1 className="stub-title">{spec.name}</h1>
    <p className="muted">{spec.purpose}</p>
    {spec.layout.length > 0 && <div className="stub-layout"><div className="eyebrow">Planned layout</div><ol>{spec.layout.map((l) => <li key={l}>{l}</li>)}</ol></div>}
    {spec.data.length > 0 && <div className="row wrap xs"><span className="eyebrow">Tables</span>{spec.data.map((d) => <Link key={d} to={`/dev/tables/${d}`}><code>{d}</code></Link>)}</div>}
    {rules.length > 0 && <div className="row wrap xs"><span className="eyebrow">Rules</span>{rules.map((r) => <Link key={r.id} to={`/dev/rules#${r.id}`}><code>{r.id}</code></Link>)}</div>}
    {spec.actions.length > 0 && <div className="row wrap xs"><span className="eyebrow">Actions</span>{spec.actions.map((a) => <Placeholder key={a.id} will={a.intent} by={by || spec.code}><Button variant="outline" size="sm">{a.label}</Button></Placeholder>)}</div>}
    <p className="small muted">{by || 'This screen is specified in the build plan and will be built by its module.'} The spec above is what the builder tool shows.</p>
    <div className="row wrap">{devMode && <Button variant="secondary" size="sm" icon="spec" onClick={() => openInspector()}>Open spec</Button>}<Link to="/"><Button variant="ghost" size="sm" icon="arrow-left">Hub</Button></Link><Link to="/dev/canvas"><Button variant="ghost" size="sm" icon="map">Canvas</Button></Link></div>
  </Card></div>);
}
