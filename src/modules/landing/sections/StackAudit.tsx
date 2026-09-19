/**
 * The audit archetype's engine: our guess of what they pay for, pre-checked, with one tap to correct each line.
 * A number they can correct beats a number they must believe (playbook 3), so every answer writes the real
 * `stack_guesses.status` through the provider (by id, realtime-ready) plus a `form_submit` event, and the savings
 * counter beside it recomputes from the live rows. Nothing here asks for an email (R-C01).
 */
import { Stat } from '../../../components/molecule/Stat/Stat';
import { Button } from '../../../components/atom/Button/Button';
import { Badge } from '../../../components/atom/Badge/Badge';
import { useData } from '../../../data/DataContext';
import type { StackGuessRow } from '../../../data/schema/core';
import { useI18n } from '../../../i18n/I18nProvider';
import { savings as computeSavings } from '../../../engine';
import type { Section, StackGuess } from '../../../engine/types';
import { track } from '../../../tracking';
import { useLanding } from '../context';
import { useCountUp, useInView, useLiveActions } from '../hooks';
import { usd } from '../format';
import { SectionShell } from './SectionShell';

type Audit = Extract<Section, { kind: 'stack_audit' }>;

export function StackAudit({ section }: { section: Audit }) {
  const { bi, t, lang } = useI18n();
  const { prospect, guesses, trackCtx, pageCode } = useLanding();
  const data = useData();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  // Live rows are the truth; the snapshot in the model is the fallback for a page rendered without its rows.
  const rows: (StackGuessRow | (StackGuess & { id?: string }))[] = guesses.length ? guesses : section.guesses;
  const live = computeSavings(prospect, rows as unknown as StackGuess[]);
  const annual = useCountUp(Math.max(0, live.net_annual), inView);
  const answered = rows.filter((r) => r.status !== 'guessed').length;

  const answer = async (tool: string, status: 'confirmed' | 'rejected') => {
    const row = guesses.find((g) => g.tool.toLowerCase() === tool.toLowerCase());
    if (!row) return `no guess named "${tool}"`;
    await data.update<StackGuessRow>('stack_guesses', row.id, { status });
    void track('form_submit', { form: 'stack_audit', tool: row.tool, answer: status, monthly_cost: row.monthly_cost }, trackCtx);
    return `${row.tool} marked ${status}`;
  };
  useLiveActions(pageCode, {
    'landing.confirmTool': (p) => answer(String(p?.tool ?? ''), 'confirmed'),
    'landing.rejectTool': (p) => answer(String(p?.tool ?? ''), 'rejected'),
  });

  return (
    <SectionShell id={section.id} kind="stack_audit" label={bi(section.headline)}>
      <div className="lp-head">
        <h2 className="lp-h2">{bi(section.headline)}</h2>
        <p className="lp-sub">{bi(section.sub)}</p>
      </div>
      <div className="lp-audit" ref={ref}>
        <ul className="lp-audit-list">
          {rows.map((g) => (
            <li key={g.tool} className={`lp-audit-row is-${g.status}`}>
              <div className="lp-audit-tool">
                <span className="lp-audit-name">{g.tool}</span>
                <span className="lp-audit-cat">{g.category} · {t('landing.replaced_by', { module: g.replaced_by })}</span>
              </div>
              <span className="lp-audit-price">{g.status === 'rejected' ? <s>{usd(g.monthly_cost, lang)}</s> : usd(g.monthly_cost, lang)}<span className="lp-audit-mo">{t('landing.per_month')}</span></span>
              <div className="lp-audit-answers">
                <Button size="sm" variant={g.status === 'confirmed' ? 'primary' : 'outline'} aria-pressed={g.status === 'confirmed'} onClick={() => void answer(g.tool, 'confirmed')}>{bi(section.confirmLabel)}</Button>
                <Button size="sm" variant={g.status === 'rejected' ? 'danger' : 'outline'} aria-pressed={g.status === 'rejected'} onClick={() => void answer(g.tool, 'rejected')}>{bi(section.rejectLabel)}</Button>
              </div>
              {g.status !== 'guessed' && <Badge tone={g.status === 'confirmed' ? 'success' : 'neutral'} size="sm">{g.status === 'confirmed' ? t('landing.confirmed') : t('landing.not_us')}</Badge>}
            </li>
          ))}
        </ul>
        <div className="lp-audit-side" aria-live="polite">
          <Stat size="lg" label={t('landing.net_year')} value={usd(annual, lang)} hint={t('landing.vs_today', { now: usd(live.monthly_current, lang), ours: usd(live.our_price_monthly, lang) })} />
          <Stat label={t('landing.answered')} value={`${answered} / ${rows.length}`} hint={t('landing.answered_hint')} />
          <p className="lp-note">{t('landing.audit_note')}</p>
        </div>
      </div>
    </SectionShell>
  );
}
