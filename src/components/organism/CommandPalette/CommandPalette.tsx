import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import type { Permission } from '../../../auth/permissions';
import { useI18n } from '../../../i18n/I18nProvider';
import { getRoutes } from '../../../app/registry';
import { isLive } from '../../../actions';
import { getTools, onToolsChange, runAction, type Tool, type ToolResult } from '../../../actions/webmcp';
import { closePalette, isPaletteShortcut, togglePalette, usePaletteState } from '../../../actions/palette';
import { matchPhrase, type Match, type SlotValue, type VoiceVocabularyEntry } from '../../../a11y/voice';
import { useVoice } from '../../../a11y/useVoice';
import { Modal } from '../Modal/Modal';
import { Input } from '../../atom/Input/Input';
import { Select } from '../../atom/Select/Select';
import { Button } from '../../atom/Button/Button';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { Field } from '../../molecule/Field/Field';
import { Placeholder } from '../../atom/Placeholder/Placeholder';
import { useToast } from '../../molecule/Toast/Toast';
import './CommandPalette.css';

/** A voice match this confident, this far ahead of the runner-up and with every slot filled runs without a click. */
const AUTO_RUN_SCORE = 0.8; const AUTO_RUN_GAP = 0.15;
const toEntry = (t: Tool): VoiceVocabularyEntry => ({ phrase: t.intent, action: t.name, slots: t.params, pages: t.hosts.map((h) => h.code), permission: t.permission ?? null });
const MicIcon = ({ on }: { on: boolean }) => <Icon name="mic" size={18} stroke={2} className={`cmdp-mic ${on ? 'is-on' : ''}`} />;

/**
 * The command palette (T46): every declared action is reachable by a typed or spoken phrase. Ctrl/Cmd+K, the TopBar
 * "Commands" button, the hub's Commands / Speak buttons and the `hub.openCommands` / `hub.voiceListen` actions open the
 * one instance `ControlBridge` mounts on every shell. Matching is `matchPhrase` over the live WebMCP tool set (same data as
 * `window.__leadmagnet.vocabulary`), role-gated with `can(permission)`; running goes through `runAction`, so the palette,
 * the CLI and an agent share one path. The microphone never starts on its own (useVoice.start needs a user gesture).
 */
export function CommandPalette() {
  const palette = usePaletteState();
  const { t, lang } = useI18n();
  const { can } = useSession();
  const { pathname } = useLocation();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ToolResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [tools, setTools] = useState<Tool[]>(getTools);
  const inputRef = useRef<HTMLInputElement>(null); const micWrap = useRef<HTMLSpanElement>(null); const listRef = useRef<HTMLDivElement>(null);
  const focusMic = () => micWrap.current?.querySelector<HTMLElement>('button')?.focus();

  useEffect(() => onToolsChange(() => setTools([...getTools()])), []);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (isPaletteShortcut(e)) { e.preventDefault(); togglePalette(); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);

  const pageCode = useMemo(() => getRoutes().find((r) => matchPath({ path: r.path, end: true }, pathname))?.spec.code, [pathname]);
  const vocabulary = useMemo(() => tools.map(toEntry), [tools]);
  const matches = useMemo<Match[]>(() => {
    if (query.trim()) return matchPhrase(query, vocabulary, { lang, page: pageCode, route: pathname, live: isLive, limit: 12 });
    return vocabulary.filter((v) => isLive(v.action)).map((entry) => ({ entry, action: entry.action, score: 1, params: {}, missing: Object.keys(entry.slots), sources: {}, phraseFilled: entry.phrase, onPage: true, live: true, coverage: 1 }));
  }, [query, vocabulary, lang, pageCode, pathname]);
  const allowed = useMemo(() => matches.filter((m) => !m.entry.permission || can(m.entry.permission as Permission)), [matches, can]);
  const hidden = matches.length - allowed.length;
  const current = allowed[Math.min(selected, Math.max(0, allowed.length - 1))];
  const currentTool = current ? tools.find((x) => x.name === current.action) : undefined;
  const slots = current ? Object.entries(current.entry.slots) : [];

  useEffect(() => { setSelected(0); }, [query]);
  useEffect(() => { if (current) setValues(Object.fromEntries(Object.entries(current.params).map(([k, v]) => [k, String(v)]))); }, [current?.action, current?.phraseFilled]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback(async (m: Match, vals: Record<string, string>) => {
    const params: Record<string, SlotValue> = {};
    for (const [k, v] of Object.entries(vals)) if (v !== '') params[k] = v;
    setBusy(true); setResult(null);
    const r = await runAction(m.action, params);
    setBusy(false); setResult(r);
    if (r.ok) { toast.push({ tone: 'success', title: t('control.result_ok'), body: r.message }); closePalette(); }
  }, [toast, t]);

  const voice = useVoice({
    lang,
    onResult: (text, final) => {
      setQuery(text); setNotice(t('control.heard', { text }));
      if (!final) return;
      const ranked = matchPhrase(text, vocabulary, { lang, page: pageCode, route: pathname, live: isLive, limit: 3 }).filter((m) => !m.entry.permission || can(m.entry.permission as Permission));
      const [top, next] = ranked;
      if (top && top.score >= AUTO_RUN_SCORE && top.missing.length === 0 && (!next || top.score - next.score >= AUTO_RUN_GAP)) void run(top, Object.fromEntries(Object.entries(top.params).map(([k, v]) => [k, String(v)])));
    },
    onError: (code) => setNotice(code === 'not-allowed' || code === 'service-not-allowed' ? t('control.denied') : code),
  });

  // Open / voice requests from the store: focus the input, and start listening only inside a user gesture.
  useEffect(() => {
    if (!palette.open) return;
    setQuery(palette.query); setResult(null); setNotice(null);
    const id = window.setTimeout(() => {
      if (palette.voice) { if (!voice.start()) { focusMic(); setNotice(voice.state === 'unsupported' ? t('control.unsupported') : voice.state === 'denied' ? t('control.denied') : t('control.gesture')); } }
      else inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [palette.open, palette.seq]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (i: number, viaClick: boolean) => {
    setSelected(i); const m = allowed[i]; if (!m) return;
    if (Object.keys(m.entry.slots).length === 0 || (!viaClick && m.missing.length === 0)) void run(m, Object.fromEntries(Object.entries(m.params).map(([k, v]) => [k, String(v)])));
    else window.setTimeout(() => listRef.current?.parentElement?.querySelector<HTMLElement>('.cmdp-params input, .cmdp-params select')?.focus(), 0);
  };
  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(allowed.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter' && current) { e.preventDefault(); choose(allowed.indexOf(current), false); }
  };
  const onMic = () => { if (voice.state === 'listening') voice.stop(); else if (!voice.start()) setNotice(voice.state === 'denied' ? t('control.denied') : t('control.gesture')); };
  const permissionLabel = (p?: string | null) => (p ? t('control.needs', { permission: p }) : t('control.any_role'));
  const optionId = (i: number) => `cmdp-opt-${i}`;

  const mic = voice.supported
    ? <Button variant={voice.state === 'listening' ? 'primary' : 'outline'} aria-pressed={voice.state === 'listening'} onClick={onMic} className="cmdp-speak" disabled={voice.state === 'denied'}><MicIcon on={voice.state === 'listening'} />{voice.state === 'listening' ? t('control.listening') : t('control.speak')}</Button>
    : <Placeholder will={t('control.unsupported')} by="Web Speech API"><Button variant="outline" className="cmdp-speak" aria-disabled="true"><MicIcon on={false} />{t('control.speak')}</Button></Placeholder>;

  return (<Modal open={palette.open} onClose={closePalette} title={t('control.title')} size="md">
    <div data-component="CommandPalette" className="cmdp" data-spatial="skip">
      <div className="cmdp-row">
        <Input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setNotice(null); }} onKeyDown={onInputKey} placeholder={t('control.placeholder')} aria-label={t('control.title')} role="combobox" aria-expanded={allowed.length > 0} aria-controls="cmdp-list" aria-activedescendant={current ? optionId(allowed.indexOf(current)) : undefined} aria-autocomplete="list" autoComplete="off" spellCheck={false} className="cmdp-input" />
        <span ref={micWrap} className="cmdp-mic-wrap">{mic}</span>
      </div>
      <p className="cmdp-status xs muted" role="status" aria-live="polite">{notice ?? (query.trim() ? t('control.matches', { n: allowed.length }) : allowed.length ? t('control.on_page') : '')}{hidden > 0 && <span> · {t('control.hidden_for_role', { n: hidden })}</span>}</p>
      <div ref={listRef} id="cmdp-list" role="listbox" aria-label={t('control.title')} className="cmdp-list">
        {allowed.length === 0 && query.trim() && <p className="cmdp-empty muted">{t('control.no_match')}</p>}
        {allowed.map((m, i) => { const tool = tools.find((x) => x.name === m.action); const host = tool?.hosts.find((h) => h.code === pageCode) ?? tool?.hosts[0]; const on = m === current; return (
          <button key={m.action} type="button" id={optionId(i)} role="option" aria-selected={on} className={`cmdp-opt ${on ? 'is-selected' : ''}`} onClick={() => choose(i, true)} onFocus={() => setSelected(i)} onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); const prev = e.currentTarget.previousElementSibling as HTMLElement | null; if (prev) prev.focus(); else inputRef.current?.focus(); } }}>
            <span className="cmdp-opt-main"><span className="cmdp-opt-label">{tool?.label ?? m.action}</span><span className="cmdp-opt-phrase muted">"{m.phraseFilled}"</span></span>
            <span className="cmdp-opt-meta">{host && <Badge tone="primary" size="sm">{host.code}</Badge>}{m.live ? <Badge status="live" size="sm">{t('control.live')}</Badge> : host && <Badge tone="neutral" size="sm">{t('control.opens', { page: host.code })}</Badge>}<Badge tone={m.entry.permission ? 'warn' : 'outline'} size="sm">{permissionLabel(m.entry.permission)}</Badge></span>
          </button>); })}
      </div>
      {current && slots.length > 0 && <form className="cmdp-params" onSubmit={(e) => { e.preventDefault(); void run(current, values); }}>
        <p className="cmdp-params-title sm"><strong>{t('control.params')}</strong> <span className="muted xs">· {currentTool?.description}</span></p>
        <div className="cmdp-fields">{slots.map(([name, type]) => { const enums = type.startsWith('enum:') ? type.slice(5).split('|') : null; const hint = currentTool?.inputSchema.properties[name]?.description; return (
          <Field key={name} label={name} hint={`${hint ?? type} · ${t('control.optional')}`}>{enums
            ? <Select options={enums.map((v) => ({ value: v, label: v }))} placeholder="—" value={values[name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))} />
            : <Input type={type === 'number' ? 'number' : 'text'} value={values[name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))} />}</Field>); })}</div>
        <div className="cmdp-actions"><Button type="submit" variant="primary" loading={busy} icon="play">{busy ? t('control.running') : t('control.run')}</Button></div>
      </form>}
      {result && !result.ok && <p className="cmdp-result is-fail" role="alert"><strong>{t('control.result_fail')}:</strong> {result.message}</p>}
      <p className="cmdp-keys xs faint">{t('control.hint_keys')} · {t('control.shortcut')}</p>
    </div>
  </Modal>);
}
