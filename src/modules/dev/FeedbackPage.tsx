import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import { FEEDBACK_KINDS, FEEDBACK_STATUS, TRIAGE, type FeedbackRow } from '../../data/schema/core';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { useT } from '../../i18n';
import { authorWeight, suggestedTriage } from '../../rules/annotations';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Select } from '../../components/atom/Select/Select';
import { Input } from '../../components/atom/Input/Input';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Field } from '../../components/molecule/Field/Field';
import { Stat } from '../../components/molecule/Stat/Stat';
import { useToast } from '../../components/molecule/Toast/Toast';

/**
 * D-09 annotations inbox. Rows arrive from the AnnotationLayer (T49) and the FeedbackButton, carrying element_path,
 * component, viewport and theme. R-F01 is enforced here: a row cannot be marked done without a triage and a
 * decision_ref, and "Needs Justin" is one button that writes triage = ask and status = waiting.
 */
export function FeedbackPage() {
  const data = useData(); const { can } = useSession(); const t = useT(); const toast = useToast();
  const [tab, setTab] = useState<string>('new');
  const [kind, setKind] = useState<string>('all');
  const [page, setPage] = useState<string>('all');
  const [sel, setSel] = useState<FeedbackRow | null>(null);
  const { rows: all } = useTable<FeedbackRow>('feedback', { orderBy: { column: 'created_at', dir: 'desc' } });
  const pages = useMemo(() => [...new Set(all.map((r) => r.page_code))].sort(), [all]);
  const rows = all.filter((r) => (tab === 'all' || r.status === tab) && (kind === 'all' || r.kind === kind) && (page === 'all' || r.page_code === page));
  const editable = can('feedback.read');

  const patch = (id: string, p: Partial<FeedbackRow>) => data.update<FeedbackRow>('feedback', id, p).then((r) => { setSel((s) => (s?.id === id ? r : s)); return r; });
  /** R-F01: done needs a recorded triage and a decision_ref. Refused loudly, never silently. */
  const setStatus = (row: FeedbackRow, status: FeedbackRow['status']) => {
    if (status === 'done' && (!row.triage || !row.decision_ref)) {
      toast.push({ tone: 'warn', title: t('annot.guard_triage'), body: t('annot.guard_triage_body', { id: row.id }) });
      return Promise.resolve(row);
    }
    return patch(row.id, { status });
  };
  const byId = (id: string) => all.find((r) => r.id === id) ?? null;

  useActions('D-09', {
    'dev.triageFeedback': (p) => patch(String(p?.id), { triage: p?.triage as FeedbackRow['triage'], triage_note: p?.note ? String(p.note) : undefined }),
    'dev.setFeedbackStatus': (p) => { const r = byId(String(p?.id)); return r ? setStatus(r, p?.status as FeedbackRow['status']) : null; },
    'dev.needsJustin': (p) => patch(String(p?.id), { triage: 'ask', status: 'waiting' }),
    'dev.filterFeedback': (p) => { if (p?.status) setTab(String(p.status)); if (p?.kind) setKind(String(p.kind)); if (p?.page) setPage(String(p.page)); return { status: p?.status ?? tab, kind: p?.kind ?? kind, page: p?.page ?? page }; },
  });

  const untriaged = all.filter((r) => r.status !== 'done' && !r.triage).length;
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-09 · {t('annot.inbox')}</h1><span className="xs muted">{t('annot.inbox_hint')}</span></div>

    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      <Stat label={t('annot.inbox')} value={all.length} />
      <Stat label={t('annot.status_new')} value={all.filter((r) => r.status === 'new').length} tone={all.some((r) => r.status === 'new') ? 'warn' : 'default'} />
      <Stat label={t('annot.status_waiting')} value={all.filter((r) => r.status === 'waiting').length} />
      <Stat label={t('annot.triaged')} value={t('annot.of_total', { n: all.length - untriaged, total: all.length })} tone={untriaged ? 'warn' : 'success'} hint="R-F01" />
    </div>

    <Tabs label={t('annot.col_status')} value={tab} onChange={setTab} tabs={[...FEEDBACK_STATUS.map((s) => ({ id: s, label: t(`annot.status_${s}`), count: all.filter((r) => r.status === s).length })), { id: 'all', label: t('annot.filter_all'), count: all.length }]} />

    <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <Field label={t('annot.filter_kind')}><Select value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: 'all', label: t('annot.filter_all') }, ...FEEDBACK_KINDS.map((k) => ({ value: k, label: t(`annot.kind_${k}`) }))]} /></Field>
      <Field label={t('annot.filter_page')}><Select value={page} onChange={(e) => setPage(e.target.value)} options={[{ value: 'all', label: t('annot.filter_all') }, ...pages.map((p) => ({ value: p, label: p }))]} /></Field>
    </div>

    <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="grid" style={{ gridTemplateColumns: sel ? 'minmax(0, 2fr) minmax(300px, 1fr)' : '1fr' }}>
      <DataTable caption={t('annot.inbox')} rows={rows} onRowClick={setSel} empty={{ title: t('annot.empty'), body: t('annot.empty_body') }} columns={[
        { key: 'kind', header: t('annot.col_kind'), render: (r) => <Badge size="sm" tone={r.kind === 'bug' ? 'danger' : r.kind === 'request' ? 'warn' : 'neutral'}>{t(`annot.kind_${r.kind}`)}</Badge> },
        { key: 'text', header: t('annot.col_text') },
        { key: 'page_code', header: t('annot.col_page'), render: (r) => <code>{r.page_code}</code> },
        { key: 'component', header: t('annot.col_component'), render: (r) => (r.component ? <code className="xs">{r.component}</code> : <span className="faint">—</span>) },
        { key: 'element_path', header: t('annot.col_element'), render: (r) => (r.element_path ? <code className="xs mono" title={r.element_path}>{r.element_path.split('>').pop()?.trim()}</code> : <span className="faint">—</span>), hideOnCard: true },
        { key: 'viewport', header: t('annot.col_viewport'), align: 'right', render: (r) => <span className="xs">{r.viewport ? `${r.viewport} px` : '—'}{r.theme ? ` · ${r.theme}` : ''}</span> },
        { key: 'user_name', header: t('annot.col_from'), render: (r) => <span>{r.user_name} <span className="faint xs">{r.role}</span></span> },
        { key: 'weight', header: t('annot.col_weight'), render: (r) => { const w = authorWeight(r.role); return <Badge size="sm" tone={w === 'binding' ? 'primary' : w === 'request' ? 'accent' : 'neutral'}>{t(`annot.weight_${w}`)}</Badge>; } },
        { key: 'triage', header: t('annot.col_triage'), render: (r) => (r.triage ? <Badge size="sm" tone="info">{t(`annot.triage_${r.triage}`)}</Badge> : <span className="faint">—</span>) },
        { key: 'status', header: t('annot.col_status'), render: (r) => <Badge size="sm">{t(`annot.status_${r.status}`)}</Badge> },
      ]} />

      {sel && <TriagePanel row={sel} editable={editable} onClose={() => setSel(null)} patch={patch} setStatus={setStatus} />}
    </div>
  </div>);
}

function TriagePanel({ row, editable, onClose, patch, setStatus }: { row: FeedbackRow; editable: boolean; onClose: () => void; patch: (id: string, p: Partial<FeedbackRow>) => void; setStatus: (row: FeedbackRow, s: FeedbackRow['status']) => void }) {
  const t = useT();
  const weight = authorWeight(row.role);
  const hint = suggestedTriage(row.role, row.kind);
  return (<Card className="stack">
    <div className="row-between"><h2>{t('annot.triage')}</h2><Button size="sm" variant="ghost" icon="close" onClick={onClose}>{t('annot.close')}</Button></div>
    <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
      <Badge size="sm" tone={row.kind === 'bug' ? 'danger' : row.kind === 'request' ? 'warn' : 'neutral'}>{t(`annot.kind_${row.kind}`)}</Badge>
      <Badge size="sm" tone={weight === 'binding' ? 'primary' : weight === 'request' ? 'accent' : 'neutral'}>{t(`annot.weight_${weight}`)}</Badge>
      <Badge size="sm">{t(`annot.status_${row.status}`)}</Badge>
    </div>
    <p className="small">{row.text}</p>
    <p className="xs muted">{row.user_name} ({row.role}) · {row.page_code} · {row.route} · {row.viewport ?? '—'} px · {row.theme ?? '—'}</p>
    <p className="xs faint mono" style={{ wordBreak: 'break-all' }}>{row.component ?? '—'} · {row.element_path ?? '—'}</p>
    <p className="xs muted">{t('annot.suggested', { triage: t(`annot.triage_${hint.triage}`), why: hint.why })}</p>
    <Link className="xs" to={row.route}>{t('annot.open_page')} →</Link>

    <Field label={t('annot.triage')} hint={t('annot.triage_hint')}><Select disabled={!editable} value={row.triage ?? ''} placeholder={t('annot.pick')} options={TRIAGE.map((x) => ({ value: x, label: t(`annot.triage_${x}`) }))} onChange={(e) => patch(row.id, { triage: (e.target.value || null) as FeedbackRow['triage'] })} /></Field>
    <Field label={t('annot.triage_note')}><Input disabled={!editable} defaultValue={row.triage_note ?? ''} key={`n-${row.id}`} onBlur={(e) => patch(row.id, { triage_note: e.target.value || null })} placeholder={hint.why} /></Field>
    <Field label={t('annot.decision_ref')} hint={t('annot.decision_ref_hint')}><Input disabled={!editable} defaultValue={row.decision_ref ?? ''} key={`d-${row.id}`} onBlur={(e) => patch(row.id, { decision_ref: e.target.value || null })} placeholder="D-012" /></Field>
    <Field label={t('annot.status')}><Select disabled={!editable} value={row.status} options={FEEDBACK_STATUS.map((s) => ({ value: s, label: t(`annot.status_${s}`) }))} onChange={(e) => setStatus(row, e.target.value as FeedbackRow['status'])} /></Field>
    <Field label={t('annot.reply')}><Input disabled={!editable} defaultValue={row.owner_reply ?? ''} key={`r-${row.id}`} onBlur={(e) => patch(row.id, { owner_reply: e.target.value || null })} /></Field>
    <Button variant="outline" size="sm" disabled={!editable} onClick={() => patch(row.id, { triage: 'ask', status: 'waiting' })} title={t('annot.to_justin_hint')}>{t('annot.to_justin')}</Button>
  </Card>);
}
