import { useState } from 'react';
import { useData, useTable } from '../../data/DataContext';
import { FEEDBACK_STATUS, TRIAGE, type FeedbackRow } from '../../data/schema/core';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Select } from '../../components/atom/Select/Select';
import { Input } from '../../components/atom/Input/Input';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Field } from '../../components/molecule/Field/Field';
export function FeedbackPage() {
  const data = useData(); const { can } = useSession();
  const [tab, setTab] = useState<string>('new'); const [sel, setSel] = useState<FeedbackRow | null>(null);
  const { rows: all } = useTable<FeedbackRow>('feedback', { orderBy: { column: 'created_at', dir: 'desc' } });
  const rows = all.filter((r) => tab === 'all' || r.status === tab);
  const patch = (id: string, p: Partial<FeedbackRow>) => data.update<FeedbackRow>('feedback', id, p).then((r) => setSel((s) => (s?.id === id ? r : s)));
  useActions('D-09', { 'dev.triageFeedback': (p) => patch(String(p?.id), { triage: p?.triage as FeedbackRow['triage'] }), 'dev.setFeedbackStatus': (p) => patch(String(p?.id), { status: p?.status as FeedbackRow['status'] }) });
  const editable = can('feedback.read');
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-09 · Feedback inbox</h1><span className="xs muted">Record triage + decision_ref before changing anything (P-08)</span></div>
    <Tabs label="Status" value={tab} onChange={setTab} tabs={[...FEEDBACK_STATUS.map((s) => ({ id: s, label: s, count: all.filter((r) => r.status === s).length })), { id: 'all', label: 'all', count: all.length }]} />
    <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="grid" style={{ gridTemplateColumns: sel ? 'minmax(0, 2fr) minmax(280px, 1fr)' : '1fr' }}>
      <DataTable caption="Feedback" rows={rows} onRowClick={setSel} empty={{ title: 'Nothing here', body: 'Testers use the Feedback button on every staff page.' }} columns={[{ key: 'kind', header: 'Kind', render: (r) => <Badge size="sm" tone={r.kind === 'bug' ? 'danger' : r.kind === 'request' ? 'warn' : 'neutral'}>{r.kind}</Badge> }, { key: 'text', header: 'Text' }, { key: 'page_code', header: 'Page', render: (r) => <code>{r.page_code}</code> }, { key: 'user_name', header: 'From', render: (r) => <span>{r.user_name} <span className="faint xs">{r.role}</span></span> }, { key: 'triage', header: 'Triage', render: (r) => (r.triage ? <Badge size="sm" tone="info">{r.triage}</Badge> : <span className="faint">—</span>) }, { key: 'status', header: 'Status', render: (r) => <Badge size="sm">{r.status}</Badge> }]} />
      {sel && <Card className="stack"><div className="row-between"><h2>Triage</h2><Button size="sm" variant="ghost" icon="close" onClick={() => setSel(null)}>Close</Button></div>
        <p className="small">{sel.text}</p><p className="xs muted">{sel.page_code} · {sel.route} · {sel.viewport} px · {sel.theme} · {sel.component ?? 'no component'}</p>
        <Field label="Triage"><Select disabled={!editable} value={sel.triage ?? ''} placeholder="Pick" options={TRIAGE.map((t) => ({ value: t, label: t }))} onChange={(e) => patch(sel.id, { triage: e.target.value as FeedbackRow['triage'] })} /></Field>
        <Field label="Status"><Select disabled={!editable} value={sel.status} options={FEEDBACK_STATUS.map((s) => ({ value: s, label: s }))} onChange={(e) => patch(sel.id, { status: e.target.value as FeedbackRow['status'] })} /></Field>
        <Field label="Decision ref" hint="D-nnn or changelog number"><Input disabled={!editable} defaultValue={sel.decision_ref ?? ''} onBlur={(e) => patch(sel.id, { decision_ref: e.target.value || null })} placeholder="D-012" /></Field>
        <Field label="Triage note"><Input disabled={!editable} defaultValue={sel.triage_note ?? ''} onBlur={(e) => patch(sel.id, { triage_note: e.target.value || null })} /></Field>
        <Field label="Reply to author"><Input disabled={!editable} defaultValue={sel.owner_reply ?? ''} onBlur={(e) => patch(sel.id, { owner_reply: e.target.value || null })} /></Field>
      </Card>}
    </div>
  </div>);
}
