import { useState } from 'react';
import { Link } from 'react-router-dom';
import { rules, type RuleStatus } from '../../rules';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
export function RulesPage() {
  const [status, setStatus] = useState<RuleStatus | 'all'>('all');
  useActions('D-05', { 'dev.filterRules': (p) => setStatus((p?.status as RuleStatus) ?? 'all') });
  const list = rules.filter((r) => status === 'all' || r.status === status);
  return (<div className="container page stack">
    <div className="page-head"><h1>D-05 · Rules</h1><span className="xs muted">{rules.length} rules · src/rules/*.ts</span></div>
    <div className="row wrap">{(['all', 'requested', 'in_dev', 'implemented', 'deprecated'] as const).map((s) => <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}</div>
    <div className="stack-sm">{list.map((r) => <Card key={r.id} id={r.id} padding="sm" className="stack-sm"><div className="row wrap"><code style={{ fontWeight: 700 }}>{r.id}</code><strong>{r.title}</strong><Badge size="sm" tone={r.status === 'implemented' ? 'success' : r.status === 'in_dev' ? 'info' : 'neutral'}>{r.status}</Badge><Badge size="sm">{r.category}</Badge></div><p className="small muted">{r.description}</p><div className="row wrap xs"><span className="faint">source: {r.source}</span>{r.implementedIn && <span className="faint">in: <code>{r.implementedIn}</code></span>}{r.pages.map((p) => <Link key={p} to="/dev/canvas"><Badge tone="primary" size="sm">{p}</Badge></Link>)}</div></Card>)}</div>
  </div>);
}
