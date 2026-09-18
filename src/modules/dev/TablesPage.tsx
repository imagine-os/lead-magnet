import { Link, useParams } from 'react-router-dom';
import { tables, tableByName, TABLE_GROUPS } from '../../data/schema';
import { useData, useTable } from '../../data/DataContext';
import type { BaseRow } from '../../data/schema/types';
import { useActions } from '../../actions';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { useToast } from '../../components/molecule/Toast/Toast';
const fmt = (v: unknown) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v));
export function TablesPage() {
  const { table } = useParams(); const data = useData(); const toast = useToast();
  const def = table ? tableByName(table) : undefined;
  const { rows } = useTable<BaseRow>(def?.name ?? 'prospects', { limit: 200 });
  useActions('D-03', { 'dev.openTable': (p) => { window.location.hash = `#/dev/tables/${p?.table}`; }, 'dev.resetDb': async () => { await data.reset?.(); toast.push({ tone: 'success', title: 'Demo data reseeded' }); } });
  const cols = def ? def.allColumns.filter((c) => !c.wide).slice(0, 9) : [];
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-03 · Tables</h1><Button variant="outline" size="sm" icon="refresh" onClick={async () => { await data.reset?.(); toast.push({ tone: 'success', title: 'Demo data reseeded' }); }}>Reset demo data</Button></div>
    <div className="row wrap">{TABLE_GROUPS.map((g) => { const list = tables.filter((t) => t.group === g.id); return list.length ? <Card key={g.id} padding="sm" className="stack-sm"><div className="eyebrow">{g.label}</div><div className="row wrap">{list.map((t) => <Link key={t.name} to={`/dev/tables/${t.name}`} className={`chip ${t.name === def?.name ? 'is-selected' : ''}`}>{t.name} <Badge size="sm">{data.peek?.(t.name)?.length ?? 0}</Badge></Link>)}</div></Card> : null; })}</div>
    {def ? (<div className="stack">
      <Card className="stack-sm"><div className="row wrap"><h2>{def.label} <code>{def.name}</code></h2><Badge size="sm">{def.group}</Badge>{def.source && <span className="xs muted">source: {def.source}</span>}</div><p className="muted small">{def.description}</p>
        <div className="row wrap xs">{def.allColumns.map((c) => <code key={c.name} title={`${c.type}${c.enum ? ` (${c.enum.join('|')})` : ''}${c.references ? ` -> ${c.references}` : ''}${c.nullable ? ', null' : ''}`}>{c.name}</code>)}</div>{def.access && <p className="xs muted">Access: {def.access.join('; ')}</p>}</Card>
      <DataTable caption={`${def.label} rows`} rows={rows} dense columns={cols.map((c) => ({ key: c.name, header: c.name, render: (r: BaseRow) => <span className="xs">{fmt(r[c.name])}</span> }))} empty={{ title: 'No rows yet', body: 'Seed this table in src/data/seed/<module>.ts' }} />
    </div>) : <p className="muted">Pick a table.</p>}
  </div>);
}
