import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listActions, onActionsChange, run, useActions } from '../../actions';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Card } from '../../components/molecule/Card/Card';
import { useToast } from '../../components/molecule/Toast/Toast';
type Row = Awaited<ReturnType<typeof listActions>>[number] & { id: string };
export function ActionsPage() {
  const [rows, setRows] = useState<Row[]>([]); const toast = useToast();
  const refresh = () => listActions().then((l) => setRows(l as Row[]));
  useEffect(() => { refresh(); return onActionsChange(refresh); }, []);
  useActions('D-04', { 'dev.runAction': async (p) => { const r = await run(String(p?.id)); toast.push({ tone: r.ok ? 'success' : 'warn', title: r.ok ? 'Ran' : 'Not live', body: r.error ?? JSON.stringify(r.result ?? '') }); return r; } });
  const live = rows.filter((r) => r.live).length;
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-04 · Actions registry</h1><span className="xs muted">The manifest is the WebMCP surface and the voice vocabulary (P-05)</span></div>
    <div className="grid grid-3"><Stat label="Declared" value={rows.length} /><Stat label="Live handlers" value={live} tone="success" hint="registered by a mounted page" /><Stat label="Pages with actions" value={new Set(rows.map((r) => r.pageCode)).size} /></div>
    <Card tone="tint" className="small"><strong>How it becomes WebMCP (T45):</strong> one tool per action, <code>name = id</code>, <code>description = intent</code>, <code>inputSchema</code> from <code>params</code>, permission checked with <code>can()</code>. Voice (T46) speaks the same intents. A page registers handlers with <code>registerActions(code, {'{ id: fn }'})</code> while mounted; "live" below means a handler exists right now.</Card>
    <DataTable caption="Actions" rows={rows.map((r) => ({ ...r, id: `${r.pageCode}:${r.id}`, actionId: r.id }))} columns={[{ key: 'actionId', header: 'Action', render: (r) => <code>{(r as Row & { actionId: string }).actionId}</code> }, { key: 'intent', header: 'Intent', render: (r) => <span>"{r.intent}"</span> }, { key: 'pageCode', header: 'Page', render: (r) => <Link to={r.path.replace(/:\w+/g, 'x')}><Badge tone="primary" size="sm">{r.pageCode}</Badge></Link> }, { key: 'permission', header: 'Permission', render: (r) => (r.permission ? <code className="xs">{r.permission}</code> : <span className="faint">any</span>) }, { key: 'params', header: 'Params', hideOnCard: true, render: (r) => <code className="xs">{r.params ? Object.entries(r.params).map(([k, v]) => `${k}: ${v}`).join(', ') : ''}</code> }, { key: 'live', header: 'Handler', render: (r) => <Badge tone={r.live ? 'success' : 'neutral'} size="sm">{r.live ? 'live' : 'not mounted'}</Badge> }, { key: 'run', header: '', align: 'right', render: (r) => <Button size="sm" variant="outline" disabled={!r.live} onClick={async () => { const res = await run((r as Row & { actionId: string }).actionId); toast.push({ tone: res.ok ? 'success' : 'warn', title: res.ok ? `Ran ${(r as Row & { actionId: string }).actionId}` : 'Not live', body: res.error }); }}>Run</Button> }]} />
  </div>);
}
