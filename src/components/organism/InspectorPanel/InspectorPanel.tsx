import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PageSpec } from '../../../specs/types';
import { specCompleteness } from '../../../specs/types';
import { rulesForPage } from '../../../rules';
import { isLive } from '../../../actions';
import { Drawer } from '../Drawer/Drawer';
import { Tabs } from '../../molecule/Tabs/Tabs';
import { Badge } from '../../atom/Badge/Badge';
import { ProgressBar } from '../../atom/ProgressBar/ProgressBar';
import './InspectorPanel.css';
type Tab = 'spec' | 'data' | 'actions' | 'rules' | 'components';
export interface InspectorPanelProps { spec: PageSpec; open: boolean; onClose: () => void; routePath: string; initialTab?: string }
/** Builder tool drawer: the page's spec with links to tables (/dev/tables/:t), rules (/dev/rules#id), components (/dev/components#Name), actions (/dev/actions). */
export function InspectorPanel({ spec, open, onClose, routePath, initialTab }: InspectorPanelProps) {
  const [tab, setTab] = useState<Tab>((initialTab as Tab) ?? 'spec');
  const c = specCompleteness(spec);
  const rules = rulesForPage(spec.code);
  const list = (items: string[] | undefined, empty: string) => (items?.length ? <ul className="insp-list">{items.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="muted xs">{empty}</p>);
  return (<Drawer open={open} onClose={onClose} title={`${spec.code} · ${spec.name}`} width={460}>
    <div className="insp">
      <div className="row wrap xs"><code>{routePath}</code>{spec.roles.map((r) => <Badge key={r} size="sm">{r}</Badge>)}</div>
      <ProgressBar value={c.score} label="Spec completeness" tone={c.score >= 80 ? 'success' : 'warn'} size="sm" />
      {c.missing.length > 0 && <p className="xs muted">Missing: {c.missing.join(', ')}</p>}
      <Tabs label="Spec sections" value={tab} onChange={setTab} tabs={[{ id: 'spec', label: 'Spec' }, { id: 'data', label: 'Data', count: spec.data.length }, { id: 'actions', label: 'Actions', count: spec.actions.length }, { id: 'rules', label: 'Rules', count: rules.length }, { id: 'components', label: 'Components', count: spec.components.length }]} />
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="insp-panel">
        {tab === 'spec' && <><p className="small">{spec.purpose}</p><h4>Layout</h4>{list(spec.layout, 'No layout yet')}<h4>Logic</h4>{list(spec.logic, 'No logic listed')}<h4>States</h4>{list(spec.states, 'No states listed')}<h4>Integrations</h4>{list(spec.integrations, 'None')}{spec.notes?.length ? <><h4>Notes</h4>{list(spec.notes, '')}</> : null}{spec.checkedAt?.length ? <p className="xs muted">Checked at: {spec.checkedAt.join(', ')} px</p> : <p className="xs muted">Not yet checked at any width (P-01)</p>}</>}
        {tab === 'data' && (spec.data.length ? <ul className="insp-list">{spec.data.map((t) => <li key={t}><Link to={`/dev/tables/${t}`}><code>{t}</code></Link></li>)}</ul> : <p className="muted xs">No tables</p>)}
        {tab === 'actions' && (spec.actions.length ? <ul className="insp-list">{spec.actions.map((a) => <li key={a.id}><code>{a.id}</code> <span className="muted">{a.intent}</span> {a.permission && <Badge size="sm">{a.permission}</Badge>} <Badge size="sm" tone={isLive(a.id) ? 'success' : 'warn'}>{isLive(a.id) ? 'live' : 'no handler'}</Badge></li>)}</ul> : <p className="muted xs">No actions declared. Every button is an action (P-05).</p>)}
        {tab === 'rules' && (rules.length ? <ul className="insp-list">{rules.map((r) => <li key={r.id}><Link to={`/dev/rules#${r.id}`}><code>{r.id}</code></Link> {r.title} <Badge size="sm">{r.status}</Badge></li>)}</ul> : <p className="muted xs">No rules reference this page</p>)}
        {tab === 'components' && (spec.components.length ? <ul className="insp-list">{spec.components.map((n) => <li key={n}><Link to={`/dev/components#${n}`}>{n}</Link></li>)}</ul> : <p className="muted xs">No components listed</p>)}
      </div>
      <div className="row wrap xs"><Link to="/dev/actions">All actions</Link><Link to={`/docs/pages/${spec.code}`}>Page doc</Link><Link to="/dev/canvas">Canvas</Link></div>
    </div>
  </Drawer>);
}
