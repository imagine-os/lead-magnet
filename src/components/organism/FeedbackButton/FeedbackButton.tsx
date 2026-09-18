import { useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useData } from '../../../data/DataContext';
import { useTheme } from '../../../design/ThemeProvider';
import { FEEDBACK_KINDS } from '../../../data/schema/core';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atom/Button/Button';
import { Field } from '../../molecule/Field/Field';
import { Select } from '../../atom/Select/Select';
import { Textarea } from '../../atom/Textarea/Textarea';
import { Input } from '../../atom/Input/Input';
import { useToast } from '../../molecule/Toast/Toast';
import './FeedbackButton.css';
/** Annotations entry point mounted by DesktopShell on every staff page: writes a `feedback` row (kind, text, element_path, component, viewport, theme). Triage happens in D-09. */
export function FeedbackButton({ pageCode, route }: { pageCode: string; route: string }) {
  const { user, role } = useSession(); const data = useData(); const { theme } = useTheme(); const toast = useToast();
  const [open, setOpen] = useState(false); const [kind, setKind] = useState<string>('comment'); const [text, setText] = useState(''); const [component, setComponent] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!text.trim()) return; setBusy(true);
    await data.insert('feedback', { user_id: user.id, user_name: user.name, role, page_code: pageCode, route, kind, text: text.trim(), element_path: null, component: component || null, viewport: String(window.innerWidth), theme, status: 'new', triage: null, triage_note: null, decision_ref: null, owner_reply: null });
    setBusy(false); setOpen(false); setText(''); setComponent(''); toast.push({ tone: 'success', title: 'Thanks, noted', body: `${kind} on ${pageCode} is in the inbox (D-09)` });
  };
  return (<>
    <button type="button" className="fbbtn" onClick={() => setOpen(true)} aria-label="Leave feedback on this page" title="Leave feedback on this page"><span aria-hidden>✎</span><span className="fbbtn-label">Feedback</span></button>
    <Modal open={open} onClose={() => setOpen(false)} title={`Feedback on ${pageCode}`} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={busy} disabled={!text.trim()}>Send</Button></>}>
      <div className="stack">
        <Field label="Kind"><Select options={FEEDBACK_KINDS.map((k) => ({ value: k, label: k }))} value={kind} onChange={(e) => setKind(e.target.value)} /></Field>
        <Field label="What did you see / want?" required><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Be concrete: what, where, expected" /></Field>
        <Field label="Component (optional)" hint="Library component name if you know it"><Input value={component} onChange={(e) => setComponent(e.target.value)} placeholder="DataTable" /></Field>
        <p className="xs muted">Recorded with: {route} · {window.innerWidth} px · {theme} · {user.name} ({role})</p>
      </div>
    </Modal>
  </>);
}
