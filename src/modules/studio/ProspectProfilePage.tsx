import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import { FONTS, LANGS, REVENUE_BANDS, TONES, WARMTH, type PageRow, type ProspectRow, type StackGuessRow } from '../../data/schema/core';
import { FIELD_WEIGHTS, applyAnswer, defaultEnricher, nextQuestions, pickArchetype, savings, type NextQuestion } from '../../engine';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Stat } from '../../components/molecule/Stat/Stat';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { useToast } from '../../components/molecule/Toast/Toast';
import { ProspectNav } from './ProspectNav';
import { industryOptions, livePageOf, parseList, pct, usd } from './lib';
import './studio.css';

type Editor = 'text' | 'number' | 'list' | 'select' | 'style';
const LIST_FIELDS = ['known_tools', 'business_roles', 'life_roles'];
const NUMBER_FIELDS = ['team_size', 'locations'];

export function ProspectProfilePage() {
  const { id } = useParams();
  const { t, bi } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const p = useRow<ProspectRow>('prospects', id);
  const { rows: guesses } = useTable<StackGuessRow>('stack_guesses', { where: { prospect_id: id ?? '' } });
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: id ?? '' } });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newRole, setNewRole] = useState({ business: '', life: '' });
  const [notes, setNotes] = useState<string | null>(null);
  const writable = can('prospects.write');

  const questions = useMemo(() => (p ? nextQuestions(p, 4) : []), [p]);
  const ranked = useMemo(() => (p ? pickArchetype(p, { guessedTools: guesses.filter((g) => g.status !== 'rejected').length }) : []), [p, guesses]);
  const sav = useMemo(() => (p ? savings(p, guesses) : null), [p, guesses]);
  const known = useMemo(() => new Set(p?.fields_known ?? []), [p]);
  const page = p ? livePageOf(pages, p.id) : null;

  const editorFor = (field: string): Editor => (field === 'style' ? 'style' : NUMBER_FIELDS.includes(field) ? 'number' : LIST_FIELDS.includes(field) ? 'list' : ['industry', 'warmth', 'lang', 'revenue_band'].includes(field) ? 'select' : 'text');
  const optionsFor = (field: string) => {
    if (field === 'industry') return industryOptions(bi);
    if (field === 'warmth') return WARMTH.map((w) => ({ value: w, label: t(`studio.warmth_${w}`) }));
    if (field === 'lang') return LANGS.map((l) => ({ value: l, label: l === 'es' ? 'Español' : 'English' }));
    if (field === 'revenue_band') return REVENUE_BANDS.map((r) => ({ value: r, label: t(`studio.band_${r}`) }));
    return [];
  };
  const coerce = (field: string, raw: string): unknown => (NUMBER_FIELDS.includes(field) ? Math.max(0, Number(raw) || 0) : LIST_FIELDS.includes(field) ? parseList(raw) : raw.trim());

  /** Every write is applyAnswer() + update by id (R-S03); confidence and the recommendation follow from the row. */
  const answer = async (field: string, raw: string) => {
    if (!p) return;
    const value = coerce(field, raw);
    if (value === '' || (Array.isArray(value) && !value.length)) { toast.push({ tone: 'warn', title: t('studio.answer_empty') }); return; }
    const next = applyAnswer(p, field as keyof ProspectRow, value as never);
    await data.update<ProspectRow>('prospects', p.id, { [field]: next[field as keyof ProspectRow], fields_known: next.fields_known, confidence: next.confidence } as Partial<ProspectRow>);
    setDraft((d) => ({ ...d, [field]: '' }));
    toast.push({ tone: 'success', title: t('studio.answer_saved', { field: t(`studio.field_${field}`, { field }) }), body: t('studio.confidence_now', { pct: pct(next.confidence) }) });
  };

  const setGuess = async (gid: string, status: StackGuessRow['status']) => { await data.update<StackGuessRow>('stack_guesses', gid, { status }); };

  const setRoles = async (kind: 'business' | 'life', list: string[]) => {
    if (!p) return;
    const field = kind === 'business' ? 'business_roles' : 'life_roles';
    const next = applyAnswer(p, field, list);
    await data.update<ProspectRow>('prospects', p.id, { [field]: list, fields_known: next.fields_known, confidence: next.confidence } as Partial<ProspectRow>);
  };
  const addRole = async (kind: 'business' | 'life', role: string) => {
    if (!p || !role.trim()) return;
    const cur = kind === 'business' ? p.business_roles : p.life_roles;
    if (cur.includes(role.trim())) return;
    await setRoles(kind, [...cur, role.trim()]);
    setNewRole((r) => ({ ...r, [kind]: '' }));
  };
  const removeRole = async (kind: 'business' | 'life', role: string) => {
    if (!p) return;
    const cur = kind === 'business' ? p.business_roles : p.life_roles;
    await setRoles(kind, cur.filter((x) => x !== role));
  };

  const setStyle = async (patch: Partial<ProspectRow['style']>, palette?: Partial<ProspectRow['style']['palette']>) => {
    if (!p) return;
    const style: ProspectRow['style'] = { ...p.style, ...patch, palette: { ...p.style.palette, ...palette } };
    const next = applyAnswer(p, 'style', style);
    await data.update<ProspectRow>('prospects', p.id, { style, fields_known: next.fields_known, confidence: next.confidence });
  };

  const fillGaps = async () => {
    if (!p) return;
    const patch = await defaultEnricher.enrich(p);
    const keys = Object.keys(patch);
    if (!keys.length) { toast.push({ tone: 'info', title: t('studio.enrich_nothing'), body: t('studio.enrich_nothing_body') }); return; }
    let merged: ProspectRow = p;
    for (const k of keys) merged = applyAnswer(merged, k as keyof ProspectRow, patch[k as keyof ProspectRow] as never);
    await data.update<ProspectRow>('prospects', p.id, { ...patch, fields_known: merged.fields_known, confidence: merged.confidence });
    toast.push({ tone: 'success', title: t('studio.enrich_done', { n: keys.length }), body: keys.join(', ') });
  };

  const saveNotes = async () => { if (!p || notes == null) return; await data.update<ProspectRow>('prospects', p.id, { notes }); toast.push({ tone: 'success', title: t('studio.notes_saved') }); };

  const latest = useRef({ answer, setGuess, addRole, removeRole, setStyle, fillGaps, saveNotes, guesses, p });
  latest.current = { answer, setGuess, addRole, removeRole, setStyle, fillGaps, saveNotes, guesses, p };
  useActions('S-02', {
    'studio.answerQuestion': (a) => latest.current.answer(String(a?.field ?? ''), String(a?.value ?? '')),
    'studio.confirmTool': (a) => { const g = latest.current.guesses.find((x) => x.tool.toLowerCase() === String(a?.tool ?? '').toLowerCase()); return g ? latest.current.setGuess(g.id, 'confirmed') : undefined; },
    'studio.rejectTool': (a) => { const g = latest.current.guesses.find((x) => x.tool.toLowerCase() === String(a?.tool ?? '').toLowerCase()); return g ? latest.current.setGuess(g.id, 'rejected') : undefined; },
    'studio.addRole': (a) => latest.current.addRole(a?.kind === 'life' ? 'life' : 'business', String(a?.role ?? '')),
    'studio.removeRole': (a) => latest.current.removeRole(a?.kind === 'life' ? 'life' : 'business', String(a?.role ?? '')),
    'studio.setStyle': (a) => { const key = String(a?.key ?? ''), value = String(a?.value ?? ''); return key === 'tone' || key === 'font' ? latest.current.setStyle({ [key]: value } as Partial<ProspectRow['style']>) : latest.current.setStyle({}, { [key]: value }); },
    'studio.saveNotes': () => latest.current.saveNotes(),
    'studio.fillGaps': () => latest.current.fillGaps(),
    'studio.runEnricher': () => { toast.push({ tone: 'info', title: t('studio.not_wired'), body: t('studio.enrich_llm_will') }); },
    'studio.openCompose': () => nav(`/studio/prospects/${latest.current.p?.id ?? ''}/compose`),
  });

  if (!p) return <div className="container page"><EmptyState icon="user" title={t('studio.not_found')} body={t('studio.not_found_body')} action={<Button variant="outline" icon="arrow-left" onClick={() => nav('/studio')}>{t('studio.all_prospects')}</Button>} /></div>;

  const top = ranked[0];
  const unknown = Object.keys(FIELD_WEIGHTS).filter((f) => !known.has(f));
  const paletteKeys = ['primary', 'accent', 'bg', 'surface', 'text'] as const;

  /** One control per question type; the Save button sits beside the Field so the Field keeps a single labelled child. */
  const questionControl = (q: NextQuestion) => {
    const kind = editorFor(q.field);
    const value = draft[q.field] ?? '';
    if (kind === 'style') return <Input readOnly aria-label={bi(q.question)} value={`${t(`studio.tone_${p.style.tone}`)} · ${p.style.palette.primary}`} />;
    if (kind === 'select') return <Select value={value} placeholder={t('studio.choose')} onChange={(e) => setDraft((d) => ({ ...d, [q.field]: e.target.value }))} options={optionsFor(q.field)} />;
    return <Input type={kind === 'number' ? 'number' : 'text'} inputMode={kind === 'number' ? 'numeric' : undefined} value={value} placeholder={kind === 'list' ? t('studio.comma_separated') : ''} onChange={(e) => setDraft((d) => ({ ...d, [q.field]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter' && writable) void answer(q.field, value); }} />;
  };
  const questionSave = (q: NextQuestion) => {
    const value = draft[q.field] ?? '';
    if (editorFor(q.field) === 'style') return <Button size="sm" variant="outline" icon="check" disabled={!writable} onClick={() => void setStyle({})}>{t('studio.mark_style_known')}</Button>;
    return <Button size="sm" icon="check" disabled={!writable || !value.trim()} onClick={() => void answer(q.field, value)}>{t('studio.save')}</Button>;
  };

  return (
    <div className="container container-wide page stack st-page">
      <ProspectNav p={p} />

      <div className="st-cols">
        <div className="stack">
          <Card className="stack-sm">
            <div className="row wrap">
              <h2 className="grow">{t('studio.s02_title')}</h2>
              <Badge size="sm" tone="ink">{t(`studio.tone_${p.style.tone}`)}</Badge>
              <Badge size="sm">{t(`studio.font_${p.style.font}`)}</Badge>
              <Badge size="sm" tone="primary">{t(`studio.source_${p.source}`)}</Badge>
              <Badge size="sm">{t(`studio.band_${p.revenue_band}`)}</Badge>
            </div>
            <div className="row wrap st-swatches" aria-label={t('studio.palette')}>
              {paletteKeys.map((k) => <span key={k} className="st-swatch"><span className="st-swatch-dot" style={{ background: p.style.palette[k] }} aria-hidden /><span className="xs muted">{t(`studio.pal_${k}`)}<code className="st-block">{p.style.palette[k]}</code></span></span>)}
            </div>
            <div className="grid grid-3">
              <Stat label={t('studio.team')} value={p.team_size} hint={t('studio.locations_n', { n: p.locations })} />
              <Stat label={t('studio.kpi_confidence')} value={pct(p.confidence)} tone={p.confidence >= 0.6 ? 'success' : p.confidence >= 0.3 ? 'warn' : 'danger'} />
              <Stat label={t('studio.net_savings')} value={sav ? usd(sav.net_annual) : '-'} tone="accent" hint={sav ? t('studio.tools_cut_n', { n: sav.tools_cut }) : ''} />
            </div>
            <ProgressBar label={t('studio.confidence')} value={Math.round(p.confidence * 100)} tone={p.confidence >= 0.6 ? 'success' : p.confidence >= 0.3 ? 'primary' : 'warn'} />
            {top && (<div className="st-reco">
              <div className="row wrap"><span className="eyebrow">{t('studio.recommended')}</span><Badge tone="primary">{t(`studio.arch_${top.archetype}`)}</Badge><span className="xs muted">{t('studio.score_n', { n: top.score })}</span></div>
              <ul className="xs muted st-reasons">{top.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              <Button size="sm" variant="outline" icon="wand" onClick={() => nav(`/studio/prospects/${p.id}/compose`)}>{t('studio.open_composer')}</Button>
            </div>)}
          </Card>

          <Card className="stack-sm">
            <h2>{t('studio.intake')}</h2>
            <p className="muted small">{t('studio.intake_sub')}</p>
            {questions.length === 0 ? <EmptyState icon="check" title={t('studio.intake_done')} body={t('studio.intake_done_body')} /> : questions.map((q) => (
              <div key={q.field} className="st-question">
                <Field label={bi(q.question)} hint={t('studio.weight_hint', { w: q.weight.toFixed(2), field: q.field })}>{questionControl(q)}</Field>
                {questionSave(q)}
              </div>
            ))}
          </Card>

          <Card className="stack-sm">
            <div className="row wrap"><h2 className="grow">{t('studio.stack')}</h2>{sav && <Badge tone="success">{t('studio.savings_month', { v: usd(sav.net_monthly) })}</Badge>}</div>
            <p className="muted small">{t('studio.stack_sub')}</p>
            {guesses.length === 0 ? <EmptyState icon="dollar" title={t('studio.no_guesses')} body={t('studio.no_guesses_body')} /> : (
              <ul className="st-guesses">
                {guesses.map((g) => (
                  <li key={g.id} className={`st-guess is-${g.status}`}>
                    <div className="grow"><span className="st-strong">{g.tool}</span> <span className="xs muted">{g.category} · {t('studio.replaced_by', { by: g.replaced_by })}</span></div>
                    <span className="st-guess-cost">{usd(g.monthly_cost)}<span className="xs muted">/mo</span></span>
                    <Badge size="sm" tone={g.status === 'confirmed' ? 'success' : g.status === 'rejected' ? 'danger' : 'neutral'}>{t(`studio.guess_${g.status}`)}</Badge>
                    <span className="xs muted">{pct(g.confidence)}</span>
                    <span className="row">
                      <Button size="sm" variant={g.status === 'confirmed' ? 'primary' : 'outline'} icon="check" disabled={!writable} onClick={() => void setGuess(g.id, 'confirmed')}>{t('studio.confirm')}</Button>
                      <Button size="sm" variant={g.status === 'rejected' ? 'danger' : 'ghost'} icon="close" disabled={!writable} onClick={() => void setGuess(g.id, 'rejected')}>{t('studio.reject')}</Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {sav && (<div className="grid grid-4">
              <Stat label={t('studio.pays_today')} value={usd(sav.monthly_current)} hint={t('studio.per_month')} />
              <Stat label={t('studio.our_price')} value={usd(sav.our_price_monthly)} hint={t(`studio.band_price_${sav.price_band}`)} />
              <Stat label={t('studio.net_month')} value={usd(sav.net_monthly)} tone="success" />
              <Stat label={t('studio.net_year')} value={usd(sav.net_annual)} tone="accent" />
            </div>)}
          </Card>
        </div>

        <div className="stack">
          <Card className="stack-sm">
            <h2>{t('studio.known')}</h2>
            <div className="row wrap">{[...known].map((f) => <Chip key={f}>{t(`studio.field_${f}`, { field: f })}</Chip>)}</div>
            <div className="eyebrow">{t('studio.unknown')}</div>
            <div className="row wrap">{unknown.length ? unknown.map((f) => <Chip key={f} className="st-chip-unknown">{t(`studio.field_${f}`, { field: f })}</Chip>) : <span className="xs muted">{t('studio.nothing_unknown')}</span>}</div>
          </Card>

          <Card className="stack-sm">
            <h2>{t('studio.roles')}</h2>
            <p className="muted small">{t('studio.roles_sub')}</p>
            {(['business', 'life'] as const).map((kind) => (
              <div key={kind} className="stack-sm">
                <div className="eyebrow">{t(`studio.roles_${kind}`)}</div>
                <div className="row wrap">{(kind === 'business' ? p.business_roles : p.life_roles).map((r) => <Chip key={r} onRemove={writable ? () => void removeRole(kind, r) : undefined} removeLabel={t('studio.remove_role', { role: r })}>{r}</Chip>)}</div>
                <div className="row wrap st-answer">
                  <Input aria-label={t(`studio.add_role_${kind}`)} placeholder={t(`studio.add_role_${kind}`)} value={newRole[kind]} onChange={(e) => setNewRole({ ...newRole, [kind]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter' && writable) void addRole(kind, newRole[kind]); }} />
                  <Button size="sm" icon="plus" disabled={!writable || !newRole[kind].trim()} onClick={() => void addRole(kind, newRole[kind])}>{t('studio.add')}</Button>
                </div>
              </div>
            ))}
          </Card>

          <Card className="stack-sm">
            <h2>{t('studio.style')}</h2>
            <p className="muted small">{t('studio.style_sub')}</p>
            <div className="grid grid-2">
              {paletteKeys.map((k) => (
                <Field key={k} label={t(`studio.pal_${k}`)} hint={p.style.palette[k]}>
                  <Input type="color" className="st-color" value={p.style.palette[k]} disabled={!writable} onChange={(e) => void setStyle({}, { [k]: e.target.value })} />
                </Field>
              ))}
            </div>
            <div className="grid grid-2">
              <Field label={t('studio.f_tone')}><Select value={p.style.tone} disabled={!writable} onChange={(e) => void setStyle({ tone: e.target.value as ProspectRow['style']['tone'] })} options={TONES.map((x) => ({ value: x, label: t(`studio.tone_${x}`) }))} /></Field>
              <Field label={t('studio.f_font')}><Select value={p.style.font} disabled={!writable} onChange={(e) => void setStyle({ font: e.target.value as ProspectRow['style']['font'] })} options={FONTS.map((x) => ({ value: x, label: t(`studio.font_${x}`) }))} /></Field>
            </div>
            <div className="st-preview" style={prospectStyle(p.style.palette, p.style.font)} aria-label={t('studio.preview')}>
              <div className="st-preview-bar"><span className="st-preview-dot" aria-hidden />{p.business_name}</div>
              <div className="st-preview-head">{t('studio.preview_head', { business: p.business_name })}</div>
              <div className="st-preview-row"><span className="st-preview-kpi">{sav ? usd(sav.net_annual) : '-'}<small>{t('studio.per_year')}</small></span><span className="st-preview-cta">{t('studio.preview_cta')}</span></div>
            </div>
          </Card>

          <Card className="stack-sm">
            <h2>{t('studio.enrichment')}</h2>
            <p className="muted small">{t('studio.enrichment_sub')}</p>
            <div className="row wrap">
              <Placeholder will={t('studio.enrich_llm_will')} by="T43"><Button variant="accent" icon="sparkles">{t('studio.enrich_ai')}</Button></Placeholder>
              <Button variant="outline" icon="wand" disabled={!writable} onClick={() => void fillGaps()}>{t('studio.fill_gaps')}</Button>
            </div>
            <Field label={t('studio.notes')} hint={t('studio.notes_hint')}>
              <Textarea value={notes ?? p.notes} disabled={!writable} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </Field>
            <div className="row wrap"><Button size="sm" variant="outline" icon="check" disabled={!writable || notes == null || notes === p.notes} onClick={() => void saveNotes()}>{t('studio.save_notes')}</Button>{page && <Badge size="sm" status={page.status}>{t(`studio.status_${page.status}`)} · {page.slug}</Badge>}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
