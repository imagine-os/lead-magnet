import { useState } from 'react';
import { componentLibrary, TIER_ORDER } from '../../design/library';
import type { Tier } from '../../design/meta';
import { useActions } from '../../actions';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import './dev.css';
export function ComponentsPage() {
  const [tier, setTier] = useState<Tier | 'all'>('all');
  useActions('D-02', { 'dev.pickTier': (p) => setTier((p?.tier as Tier) ?? 'all') });
  const list = componentLibrary.filter((m) => tier === 'all' || m.tier === tier);
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-02 · Component library</h1><span className="xs muted">{componentLibrary.length} components · no component without a meta, no meta without a usage</span></div>
    <Tabs label="Tier" value={tier} onChange={setTier} tabs={[{ id: 'all', label: 'All', count: componentLibrary.length }, ...TIER_ORDER.map((t) => ({ id: t, label: t, count: componentLibrary.filter((m) => m.tier === t).length }))]} />
    <div role="tabpanel" id={`panel-${tier}`} aria-labelledby={`tab-${tier}`} className="stack">
      {list.map((m) => (<Card key={m.name} id={m.name} className="stack comp-card">
        <div className="row wrap"><h2 className="comp-name">{m.name}</h2><Badge size="sm">{m.tier}</Badge>{m.usedBy?.map((c) => <Badge key={c} tone="primary" size="sm">{c}</Badge>)}</div>
        <p className="muted small">{m.description}</p>
        {m.usages.map((u) => <div key={u.title} className="comp-usage"><div className="eyebrow">{u.title}</div><div className="comp-usage-stage">{u.render()}</div></div>)}
        <details className="comp-details"><summary>Props, states, a11y</summary>
          <table className="comp-props"><thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>{m.props.map((p) => <tr key={p.name}><td><code>{p.name}{p.required ? '*' : ''}</code></td><td><code className="xs">{p.type}</code></td><td>{p.default ?? ''}</td><td>{p.description}</td></tr>)}</tbody></table>
          <div className="row wrap xs"><span className="eyebrow">States</span>{m.states.map((s) => <Badge key={s} size="sm">{s}</Badge>)}</div>
          <ul className="xs">{m.a11y.map((a) => <li key={a}>{a}</li>)}</ul>
        </details>
      </Card>))}
    </div>
  </div>);
}
