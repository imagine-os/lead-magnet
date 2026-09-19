import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listActions, onActionsChange, useActions } from '../../actions';
import { getTool, getTools, onToolsChange, runAction, webmcpStatus, type Tool, type ToolResult } from '../../actions/webmcp';
import { intentSlots } from '../../actions/schema';
import { useSession } from '../../auth/SessionProvider';
import type { Permission } from '../../auth/permissions';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Modal } from '../../components/organism/Modal/Modal';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Field } from '../../components/molecule/Field/Field';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Card } from '../../components/molecule/Card/Card';
import { useToast } from '../../components/molecule/Toast/Toast';

type Row = Awaited<ReturnType<typeof listActions>>[number] & { id: string; actionId: string };
const voicePhrase = (intent: string, params: Record<string, unknown>) => intent.replace(/\{(\w+)\}/g, (m, k: string) => (params[k] != null && params[k] !== '' ? String(params[k]) : m));

/** D-04: the actions manifest as the WebMCP surface. Every "Run" goes through the same `runAction` the CLI, Playwright and voice use. */
export function ActionsPage() {
  const [rows, setRows] = useState<Row[]>([]); const [tick, setTick] = useState(0); const toast = useToast(); const { can } = useSession();
  const [open, setOpen] = useState<Tool | null>(null); const [params, setParams] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [last, setLast] = useState<ToolResult | null>(null);
  const refresh = () => listActions().then((l) => setRows(l.map((r) => ({ ...r, actionId: r.id, id: `${r.pageCode}:${r.path}:${r.id}` }))));
  useEffect(() => { refresh(); const a = onActionsChange(refresh); const b = onToolsChange(() => setTick((n) => n + 1)); return () => { a(); b(); }; }, []);
  const status = useMemo(() => webmcpStatus(), [tick, rows]); // eslint-disable-line react-hooks/exhaustive-deps
  const runNow = async (id: string, p: Record<string, unknown>) => {
    setBusy(true);
    const r = await runAction(id, Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v != null)));
    setBusy(false); setLast(r);
    toast.push({ tone: r.ok ? 'success' : 'warn', title: r.ok ? `Ran ${id}` : `${id} did not run`, body: r.message });
    return r;
  };
  useActions('D-04', { 'dev.runAction': (p) => { const { id, params: nested, ...rest } = (p ?? {}) as { id?: string; params?: Record<string, unknown> } & Record<string, unknown>; return runNow(String(id), nested ?? rest); } });
  const openTool = (id: string) => { const t = getTool(id); if (!t) return; setOpen(t); setLast(null); setParams(Object.fromEntries(Object.keys(t.params).map((k) => [k, '']))); };
  const live = rows.filter((r) => r.live).length; const tools = getTools();
  const allowed = (perm?: string) => !perm || can(perm as Permission);
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-04 · Actions registry</h1><span className="xs muted">The manifest is the WebMCP surface and the voice vocabulary (P-05)</span></div>
    <div className="grid grid-4"><Stat label="Declared" value={rows.length} hint={`${new Set(rows.map((r) => r.pageCode)).size} pages`} /><Stat label="Live handlers" value={live} tone="success" hint="registered by a mounted page" /><Stat label="WebMCP tools" value={tools.length} hint="one per unique action id" /><Stat label="Registered via" value={status.registered === 'navigator' ? 'navigator.modelContext' : 'window fallback'} tone={status.available ? 'success' : 'default'} hint={status.available ? 'browser has WebMCP' : 'no navigator.modelContext; window.__leadmagnet.tools + runAction()'} /></div>
    <Card tone="tint" className="small"><strong>How it works:</strong> one tool per action, <code>name = id</code>, <code>description = intent</code>, <code>inputSchema</code> from <code>params</code>, permission checked with <code>can()</code>. If the page is not mounted, running navigates there first, waits for the handler, then calls it. The same call within 1.5 s is deduplicated. Terminal: <code>npm run actions -- list</code>, <code>npm run actions -- run plan.setStatus --param status=doing</code>. Model: <Link to="/docs">docs/reference/control.md</Link>.</Card>
    <DataTable caption="Actions" rows={rows} columns={[
      { key: 'actionId', header: 'Action', render: (r) => <code>{r.actionId}</code> },
      { key: 'intent', header: 'Voice phrase', render: (r) => <span>"{r.intent}"</span> },
      { key: 'pageCode', header: 'Page', render: (r) => <Link to={r.path.replace(/:\w+/g, 'x')}><Badge tone="primary" size="sm">{r.pageCode}</Badge></Link> },
      { key: 'permission', header: 'Permission', render: (r) => (r.permission ? <code className="xs">{r.permission}</code> : <span className="faint">any</span>) },
      { key: 'params', header: 'Params', hideOnCard: true, render: (r) => <code className="xs">{r.params ? Object.entries(r.params).map(([k, v]) => `${k}: ${v}`).join(', ') : ''}</code> },
      { key: 'live', header: 'Handler', render: (r) => <Badge tone={r.live ? 'success' : 'neutral'} size="sm">{r.live ? 'live' : 'opens page'}</Badge> },
      { key: 'run', header: '', align: 'right', render: (r) => <Button size="sm" variant="outline" disabled={!allowed(r.permission)} title={allowed(r.permission) ? undefined : `needs ${r.permission}`} onClick={() => openTool(r.actionId)}>Run</Button> },
    ]} />
    <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `Run ${open.name}` : ''} size="md"
      footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Close</Button><Button variant="primary" icon="check" loading={busy} disabled={!open || !allowed(open.permission)} onClick={() => open && runNow(open.name, params)}>Run</Button></>}>
      {open && <div className="stack">
        <div className="row wrap xs">{open.hosts.map((h) => <Badge key={h.path} tone="primary" size="sm">{h.code}</Badge>)}<Badge tone={open.live ? 'success' : 'neutral'} size="sm">{open.live ? 'handler live' : `opens ${open.hosts[0]?.path}`}</Badge>{open.permission && <Badge tone={allowed(open.permission) ? 'info' : 'warn'} size="sm">{open.permission}</Badge>}</div>
        <p className="small"><strong>Say:</strong> "{voicePhrase(open.intent, params)}"{intentSlots(open.intent).length > 0 && <span className="muted"> · slots: {intentSlots(open.intent).join(', ')}</span>}</p>
        {Object.keys(open.params).length > 0 && <div className="grid grid-2">{Object.entries(open.params).map(([k, type]) => {
          const prop = open.inputSchema.properties[k]; const set = (v: string) => setParams((s) => ({ ...s, [k]: v }));
          return (<Field key={k} label={k} hint={prop?.description}>{prop?.enum ? <Select options={prop.enum.map((v) => ({ value: v, label: v }))} placeholder="(leave default)" value={params[k] ?? ''} onChange={(e) => set(e.target.value)} /> : <Input type={type === 'number' ? 'number' : 'text'} value={params[k] ?? ''} placeholder={type === 'date' ? 'YYYY-MM-DDTHH:mm:ssZ' : type} onChange={(e) => set(e.target.value)} />}</Field>);
        })}</div>}
        <details><summary className="small">JSON Schema</summary><pre className="xs" style={{ overflow: 'auto' }}><code>{JSON.stringify({ name: open.name, description: open.description, inputSchema: open.inputSchema }, null, 2)}</code></pre></details>
        {last && <Card tone={last.ok ? 'surface' : 'tint'} padding="sm" className="small"><strong>{last.ok ? 'ok' : 'not run'}</strong> · {last.message}{last.data !== undefined && <pre className="xs" style={{ overflow: 'auto' }}><code>{JSON.stringify(last.data, null, 2)}</code></pre>}</Card>}
      </div>}
    </Modal>
  </div>);
}
