import { useMemo, useState } from 'react';
import { useTable } from '../../data/DataContext';
import type { ProspectRow } from '../../data/schema/core';
import type { IntakeTurnRow } from '../../data/schema/studio';
import { nextQuestions, pickArchetype } from '../../engine';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { useToast } from '../../components/molecule/Toast/Toast';
import { confidenceGain, editorFor, fieldOptions, fieldWeight, suggestionsFor } from './fields';
import { extractFacts, type FactProposal } from './extract';
import { pct, shortTime } from './lib';

export type AnswerSource = 'manual' | 'rule' | 'llm';
export interface IntakeChatProps {
  p: ProspectRow;
  writable: boolean;
  /** Saves one answer: applyAnswer + update by id + an intake_turns row (R-S03, R-S06). */
  onAnswer: (field: string, raw: string, source: AnswerSource, question: string) => Promise<boolean>;
  /** The rule enricher ("Ask the AI"): fills what the industry catalog already implies and records source = rule. */
  onAskAi: () => Promise<void>;
}

/**
 * S-02's conversational intake: one question at a time, with the reason it matters and how much it would move the
 * page, the transcript of everything answered so far, and a paste-facts box that PROPOSES answers a person confirms.
 */
export function IntakeChat({ p, writable, onAnswer, onAskAi }: IntakeChatProps) {
  const { t, bi, lang } = useI18n();
  const toast = useToast();
  const { rows: turns } = useTable<IntakeTurnRow>('intake_turns', { where: { prospect_id: p.id } });
  const [draft, setDraft] = useState('');
  const [skipped, setSkipped] = useState<string[]>([]);
  const [paste, setPaste] = useState('');
  const [proposals, setProposals] = useState<FactProposal[] | null>(null);
  const [busy, setBusy] = useState(false);

  const queue = useMemo(() => nextQuestions(p, 12).filter((q) => !skipped.includes(q.field)), [p, skipped]);
  const q = queue[0] ?? null;
  const ranked = useMemo(() => pickArchetype(p), [p]);
  const sorted = useMemo(() => [...turns].sort((a, b) => String(a.ts).localeCompare(String(b.ts))), [turns]);
  const kind = q ? editorFor(q.field) : 'text';
  const suggestions = q ? suggestionsFor(q.field, p) : [];
  const gain = q ? confidenceGain(p, q.field) : 0;

  const addSuggestion = (s: string) => setDraft((d) => (kind === 'list' ? [...d.split(',').map((x) => x.trim()).filter(Boolean), s].join(', ') : s));

  const save = async () => {
    if (!q || !writable) return;
    setBusy(true);
    try { if (await onAnswer(q.field, draft, 'manual', bi(q.question))) setDraft(''); } finally { setBusy(false); }
  };
  const skip = () => { if (q) { setSkipped((s) => [...s, q.field]); setDraft(''); } };
  const askAi = async () => { setBusy(true); try { await onAskAi(); } finally { setBusy(false); } };

  const extract = () => {
    const found = extractFacts(paste, p);
    setProposals(found);
    toast.push({ tone: found.length ? 'info' : 'warn', title: found.length ? t('studio.facts_found', { n: found.length }) : t('studio.facts_none'), body: t('studio.facts_confirm_note') });
    return found.length;
  };
  const applyProposal = async (f: FactProposal) => {
    setBusy(true);
    try {
      const okDone = await onAnswer(f.field, f.value, 'rule', t('studio.facts_question', { field: t(`studio.field_${f.field}`, { field: f.field }) }));
      if (okDone) setProposals((list) => (list ?? []).filter((x) => x.id !== f.id));
    } finally { setBusy(false); }
  };
  const dismissProposal = (id: string) => setProposals((list) => (list ?? []).filter((x) => x.id !== id));

  useActions('S-02', {
    'studio.skipQuestion': () => { skip(); return q?.field; },
    'studio.pasteFacts': (a) => { setPaste(String(a?.text ?? '')); return true; },
    'studio.extractFacts': () => extract(),
    'studio.applyFact': (a) => { const f = (proposals ?? []).find((x) => x.field === String(a?.fact ?? '') || x.id === String(a?.fact ?? '')); return f ? applyProposal(f) : undefined; },
    'studio.dismissFact': (a) => { dismissProposal(String(a?.fact ?? '')); return true; },
  });

  const control = () => {
    if (!q) return null;
    if (kind === 'style') return <Input readOnly aria-label={bi(q.question)} value={`${t(`studio.tone_${p.style.tone}`)} · ${p.style.palette.primary}`} />;
    if (kind === 'select') return <Select value={draft} placeholder={t('studio.choose')} onChange={(e) => setDraft(e.target.value)} options={fieldOptions(q.field, t, bi)} />;
    return <Input type={kind === 'number' ? 'number' : 'text'} inputMode={kind === 'number' ? 'numeric' : undefined} value={draft} placeholder={kind === 'list' ? t('studio.comma_separated') : ''} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void save(); }} />;
  };

  return (
    <Card className="stack-sm">
      <div className="row wrap">
        <h2 className="grow">{t('studio.intake')}</h2>
        <Badge size="sm" tone={p.confidence >= 0.6 ? 'success' : 'neutral'}>{t('studio.confidence')} {pct(p.confidence)}</Badge>
        <Badge size="sm" tone="primary">{t('studio.arch_' + (ranked[0]?.archetype ?? 'reveal'))}</Badge>
      </div>
      <p className="muted small">{t('studio.intake_sub')}</p>

      <ol className="st-thread" aria-label={t('studio.transcript')} tabIndex={0}>
        {sorted.map((turn) => (
          <li key={turn.id} className="st-turn">
            <div className="st-bubble is-ask"><span className="xs muted st-block">{t(`studio.field_${turn.field}`, { field: turn.field })} · {shortTime(turn.ts, lang)}</span>{turn.question}</div>
            <div className="st-bubble is-answer">
              <span className="st-strong">{turn.answer}</span>
              <span className="row wrap st-cell-gap"><Badge size="sm" tone={turn.source === 'manual' ? 'ink' : turn.source === 'rule' ? 'info' : 'accent'}>{t(`studio.src_${turn.source}`)}</Badge><span className="xs muted">{t('studio.confidence')} {pct(turn.confidence_after)}</span></span>
            </div>
          </li>
        ))}
        {!sorted.length && <li className="xs muted">{t('studio.transcript_empty')}</li>}
      </ol>

      {q ? (
        <div className="st-ask">
          <div className="st-bubble is-ask is-current">
            <span className="eyebrow">{t('studio.asking_n', { n: queue.length })}</span>
            <span className="st-ask-q">{bi(q.question)}</span>
            <span className="xs muted st-block">{t('studio.why_matters', { why: t(`studio.effect_${q.field}`, { field: q.field }) })}</span>
            <span className="xs muted st-block">{t('studio.gain_hint', { pts: gain, w: fieldWeight(q.field).toFixed(2) })}</span>
          </div>
          {!!suggestions.length && (
            <div className="row wrap" role="group" aria-label={t('studio.suggestions')}>
              {suggestions.map((s) => <Chip key={s} onClick={writable ? () => addSuggestion(s) : undefined}>{s}</Chip>)}
            </div>
          )}
          <div className="st-question">
            <Field label={bi(q.question)} hint={t('studio.weight_hint', { w: fieldWeight(q.field).toFixed(2), field: q.field })}>{control()}</Field>
            <div className="row wrap st-cell-gap">
              <Button size="sm" icon="check" loading={busy} disabled={!writable || (kind !== 'style' && !draft.trim())} onClick={() => void save()}>{kind === 'style' ? t('studio.mark_style_known') : t('studio.save')}</Button>
              <Button size="sm" variant="ghost" icon="arrow-right" onClick={skip}>{t('studio.skip')}</Button>
            </div>
          </div>
          <div className="row wrap">
            <Button size="sm" variant="outline" icon="wand" loading={busy} disabled={!writable} onClick={() => void askAi()}>{t('studio.ask_ai')}</Button>
            <Placeholder will={t('studio.enrich_llm_will')} by="T43"><Button size="sm" variant="accent" icon="sparkles">{t('studio.ask_llm')}</Button></Placeholder>
          </div>
        </div>
      ) : <EmptyState icon="check" title={t('studio.intake_done')} body={skipped.length ? t('studio.intake_skipped', { n: skipped.length }) : t('studio.intake_done_body')} action={skipped.length ? <Button size="sm" variant="outline" icon="refresh" onClick={() => setSkipped([])}>{t('studio.unskip')}</Button> : undefined} />}

      <div className="stack-sm st-paste">
        <Field label={t('studio.paste_facts')} hint={t('studio.paste_hint')}>
          <Textarea value={paste} rows={4} disabled={!writable} placeholder={t('studio.paste_placeholder')} onChange={(e) => setPaste(e.target.value)} />
        </Field>
        <div className="row wrap">
          <Button size="sm" variant="outline" icon="search" disabled={!writable || paste.trim().length < 12} onClick={extract}>{t('studio.extract')}</Button>
          {paste && <Button size="sm" variant="ghost" icon="close" onClick={() => { setPaste(''); setProposals(null); }}>{t('studio.clear')}</Button>}
          <span className="xs muted">{t('studio.facts_confirm_note')}</span>
        </div>
        {proposals && (proposals.length ? (
          <ul className="st-proposals">
            {proposals.map((f) => (
              <li key={f.id} className="st-proposal">
                <div className="grow stack-sm st-proposal-body">
                  <div className="row wrap st-cell-gap"><Badge size="sm" tone="warn">{t('studio.proposed')}</Badge><span className="st-strong">{t(`studio.field_${f.field}`, { field: f.field })}</span><span>{f.display}</span></div>
                  <span className="xs muted">{bi(f.why)}</span>
                  <q className="xs muted st-evidence">{f.evidence}</q>
                </div>
                <div className="row wrap st-cell-gap">
                  <Button size="sm" icon="check" loading={busy} disabled={!writable} onClick={() => void applyProposal(f)}>{t('studio.apply')}</Button>
                  <Button size="sm" variant="ghost" icon="close" onClick={() => dismissProposal(f.id)}>{t('studio.dismiss')}</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="xs muted">{t('studio.facts_none')}</p>)}
      </div>
    </Card>
  );
}
