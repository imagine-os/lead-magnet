import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useData, useTable } from '../../../data/DataContext';
import { useTheme } from '../../../design/ThemeProvider';
import { useT } from '../../../i18n';
import { FEEDBACK_KINDS, FEEDBACK_STATUS, TRIAGE, type FeedbackRow } from '../../../data/schema/core';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Select } from '../../atom/Select/Select';
import { Textarea } from '../../atom/Textarea/Textarea';
import { Field } from '../../molecule/Field/Field';
import { useToast } from '../../molecule/Toast/Toast';
import { Modal } from '../Modal/Modal';
import { Drawer } from '../Drawer/Drawer';
import { authorWeight } from '../../../rules/annotations';
import { lastSegment, nearestComponent, resolveElement, stableSelector } from './elementPath';
import './AnnotationLayer.css';

export interface AnnotationLayerProps { pageCode: string; route: string }
interface Anchor { row: FeedbackRow; n: number; rect: DOMRect | null }

const IGNORE = '.annot, .annot-pin, .annot-bar, dialog, .drawer-scrim, .toasts, .specchip, .insp-panel';

/**
 * T49 pins. With dev mode on, or for anyone who can read feedback, a floating Annotate toggle turns the page into a
 * target: click (or focus and press Enter on) any element to file a comment, request, bug, idea or question against it.
 * The row records `element_path`, `component`, `viewport`, `theme`, `page_code`, `route`, role and user, so triage in
 * D-09 knows exactly what was being looked at. Existing rows come back as numbered dots anchored to their element;
 * rows whose element is gone are listed in the drawer instead. The layer never swallows a click outside annotate mode
 * and never covers the page (R-F03).
 */
export function AnnotationLayer({ pageCode, route }: AnnotationLayerProps) {
  const t = useT();
  const { user, role, devMode, can } = useSession();
  const data = useData();
  const { theme } = useTheme();
  const toast = useToast();
  const visible = devMode || can('feedback.read');

  const { rows } = useTable<FeedbackRow>('feedback', { orderBy: { column: 'created_at', dir: 'asc' } });
  const mine = useMemo(() => rows.filter((r) => r.page_code === pageCode), [rows, pageCode]);

  const [on, setOn] = useState(false);
  const [draft, setDraft] = useState<{ selector: string; component: string; label: string } | null>(null);
  const [kind, setKind] = useState<string>('comment');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const onRef = useRef(on);
  onRef.current = on;

  // --- anchoring: measure every pinned element, re-measure on resize, scroll and data change ---
  const measure = useCallback(() => {
    setAnchors(mine.map((row, i) => {
      const el = resolveElement(row.element_path);
      return { row, n: i + 1, rect: el ? el.getBoundingClientRect() : null };
    }));
  }, [mine]);
  useLayoutEffect(() => { if (!visible) return; measure(); }, [visible, measure]);
  useEffect(() => {
    if (!visible) return;
    const run = () => measure();
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);
    const id = window.setInterval(run, 1000);
    return () => { window.removeEventListener('resize', run); window.removeEventListener('scroll', run, true); window.clearInterval(id); };
  }, [visible, measure]);

  // --- annotate mode: capture a click or Enter anywhere and turn it into a draft ---
  const capture = useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    if (target.closest(IGNORE)) return false;
    const selector = stableSelector(target);
    setDraft({ selector, component: nearestComponent(target), label: lastSegment(selector) });
    setKind('comment'); setText('');
    return true;
  }, []);
  useEffect(() => {
    if (!visible || !on) return;
    const onClick = (e: MouseEvent) => { if (capture(e.target)) { e.preventDefault(); e.stopPropagation(); } };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOn(false); return; }
      if (e.key !== 'Enter' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (capture(document.activeElement)) { e.preventDefault(); e.stopPropagation(); }
    };
    // the highlight follows the pointer AND the keyboard focus: annotate mode is never hover-only (P-03)
    let marked: Element | null = null;
    const mark = (target: EventTarget | null) => {
      const el = target instanceof Element && !target.closest(IGNORE) ? target : null;
      if (el === marked) return;
      marked?.removeAttribute('data-annot-target');
      marked = el;
      marked?.setAttribute('data-annot-target', 'true');
    };
    const onMove = (e: MouseEvent) => mark(e.target);
    const onFocus = (e: FocusEvent) => mark(e.target);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mouseover', onMove, true);
    document.addEventListener('focusin', onFocus, true);
    document.body.setAttribute('data-annotating', 'true');
    return () => {
      document.removeEventListener('click', onClick, true); document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mouseover', onMove, true); document.removeEventListener('focusin', onFocus, true);
      marked?.removeAttribute('data-annot-target'); document.body.removeAttribute('data-annotating');
    };
  }, [visible, on, capture]);

  const submit = async () => {
    if (!draft || !text.trim()) return;
    setBusy(true);
    await data.insert<FeedbackRow>('feedback', {
      user_id: user.id, user_name: user.name, role, page_code: pageCode, route,
      kind: kind as FeedbackRow['kind'], text: text.trim(),
      element_path: draft.selector, component: draft.component, viewport: String(window.innerWidth), theme,
      status: 'new', triage: null, triage_note: null, decision_ref: null, owner_reply: null,
    } as Omit<FeedbackRow, 'id' | 'created_at' | 'updated_at'>);
    setBusy(false); setDraft(null); setText(''); setOn(false);
    toast.push({ tone: 'success', title: t('annot.saved'), body: t('annot.saved_body', { component: draft.component, page: pageCode }) });
  };

  const patch = (id: string, p: Partial<FeedbackRow>) => data.update<FeedbackRow>('feedback', id, p);

  if (!visible) return null;
  const placed = anchors.filter((a) => a.rect && a.rect.width > 0);
  const orphans = anchors.filter((a) => !a.rect || a.rect.width === 0);
  const open = anchors.find((a) => a.row.id === openPin) ?? null;

  return (<>
    <div className="annot-bar" role="group" aria-label={t('annot.tools')}>
      <button type="button" className={`annot-toggle ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => { setOn((v) => !v); setOpenPin(null); }} title={t('annot.toggle_hint')}>
        <span aria-hidden>◎</span><span className="annot-toggle-label">{on ? t('annot.annotating') : t('annot.annotate')}</span>
      </button>
      <button type="button" className="annot-count" onClick={() => setDrawer(true)} aria-label={t('annot.open_list', { n: mine.length })}>
        {mine.length}<span className="annot-count-label">{t('annot.pins')}</span>
      </button>
    </div>

    {on && <p className="annot-hint" role="status">{t('annot.hint')}</p>}

    <div className="annot-layer" aria-hidden={!placed.length}>
      {placed.map((a) => (
        <button key={a.row.id} type="button" className={`annot-pin annot-pin-${a.row.kind} ${a.row.status === 'done' ? 'is-done' : ''} ${openPin === a.row.id ? 'is-open' : ''}`}
          style={{ top: `${(a.rect as DOMRect).top + window.scrollY}px`, left: `${(a.rect as DOMRect).left + window.scrollX}px` }}
          aria-label={t('annot.pin_label', { n: a.n, kind: a.row.kind, who: a.row.user_name })}
          aria-expanded={openPin === a.row.id}
          onClick={() => setOpenPin((p) => (p === a.row.id ? null : a.row.id))}>{a.n}</button>
      ))}
    </div>

    {open && <Modal open onClose={() => setOpenPin(null)} title={t('annot.thread', { n: open.n })}
      footer={<Button variant="ghost" onClick={() => setOpenPin(null)}>{t('annot.close')}</Button>}>
      <Thread row={open.row} editable={can('feedback.read')} patch={patch} />
    </Modal>}

    <Drawer open={drawer} onClose={() => setDrawer(false)} title={t('annot.all_on_page', { page: pageCode })}>
      <div className="stack annot-list">
        <p className="xs muted">{t('annot.list_hint', { placed: placed.length, orphans: orphans.length })}</p>
        {mine.length === 0 && <p className="small muted">{t('annot.none')}</p>}
        {anchors.map((a) => (<div key={a.row.id} className={`annot-item ${a.rect ? '' : 'is-orphan'}`}>
          <div className="row annot-item-top"><Badge size="sm" tone={a.row.kind === 'bug' ? 'danger' : a.row.kind === 'request' ? 'warn' : 'neutral'}>{a.row.kind}</Badge><Badge size="sm">{a.row.status}</Badge>{!a.rect && <Badge size="sm" tone="info">{t('annot.orphan')}</Badge>}</div>
          <p className="small">{a.row.text}</p>
          <p className="xs faint mono">{a.row.component} · {a.row.element_path ?? t('annot.no_element')}</p>
          <Button size="sm" variant="ghost" onClick={() => { setOpenPin(a.row.id); setDrawer(false); }}>{t('annot.open_thread')}</Button>
        </div>))}
      </div>
    </Drawer>

    <Modal open={!!draft} onClose={() => setDraft(null)} title={t('annot.new_on', { component: draft?.component ?? '' })}
      footer={<><Button variant="ghost" onClick={() => setDraft(null)}>{t('annot.cancel')}</Button><Button onClick={submit} loading={busy} disabled={!text.trim()}>{t('annot.file')}</Button></>}>
      <div className="stack">
        <Field label={t('annot.kind')}><Select options={FEEDBACK_KINDS.map((k) => ({ value: k, label: t(`annot.kind_${k}`) }))} value={kind} onChange={(e) => setKind(e.target.value)} /></Field>
        <Field label={t('annot.what')} required><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('annot.what_placeholder')} rows={4} /></Field>
        <p className="xs muted mono annot-ctx">{draft?.component} · {draft?.selector}</p>
        <p className="xs muted">{t('annot.recorded', { route, width: String(window.innerWidth), theme, who: user.name, role })}</p>
      </div>
    </Modal>
  </>);
}

function Thread({ row, editable, patch }: { row: FeedbackRow; editable: boolean; patch: (id: string, p: Partial<FeedbackRow>) => void }) {
  const t = useT();
  const weight = authorWeight(row.role);
  return (<div className="stack annot-thread">
    <div className="row annot-item-top">
      <Badge size="sm" tone={row.kind === 'bug' ? 'danger' : row.kind === 'request' ? 'warn' : 'neutral'}>{row.kind}</Badge>
      <Badge size="sm">{row.status}</Badge>
      {row.triage && <Badge size="sm" tone="info">{row.triage}</Badge>}
      <Badge size="sm" tone={weight === 'binding' ? 'primary' : weight === 'request' ? 'accent' : 'neutral'}>{t(`annot.weight_${weight}`)}</Badge>
    </div>
    <p>{row.text}</p>
    <p className="xs muted">{row.user_name} ({row.role}) · {row.page_code} · {row.route} · {row.viewport} px · {row.theme}</p>
    <p className="xs faint mono">{row.component} · {row.element_path ?? '—'}</p>
    {row.triage_note && <p className="small"><strong>{t('annot.triage_note')}:</strong> {row.triage_note}</p>}
    {row.decision_ref && <p className="small"><strong>{t('annot.decision_ref')}:</strong> <code>{row.decision_ref}</code></p>}
    {row.owner_reply && <p className="small annot-reply"><strong>{t('annot.reply')}:</strong> {row.owner_reply}</p>}
    {editable && <>
      <Field label={t('annot.triage')} hint={t('annot.triage_hint')}>
        <Select value={row.triage ?? ''} placeholder={t('annot.pick')} options={TRIAGE.map((x) => ({ value: x, label: t(`annot.triage_${x}`) }))} onChange={(e) => patch(row.id, { triage: (e.target.value || null) as FeedbackRow['triage'] })} />
      </Field>
      <Field label={t('annot.status')}>
        <Select value={row.status} options={FEEDBACK_STATUS.map((s) => ({ value: s, label: t(`annot.status_${s}`) }))} onChange={(e) => patch(row.id, { status: e.target.value as FeedbackRow['status'] })} />
      </Field>
    </>}
    {!editable && <p className="xs muted">{t('annot.readonly')}</p>}
  </div>);
}
