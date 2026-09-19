/**
 * Loss aversion with a concrete number (playbook 3). Their guessed stack, one row per tool, struck through one after
 * another as the section arrives, with a **running total in text** beside it - "Cancelled so far: $412 a month,
 * 6 of 9 tools crossed off". The sequence is the point: a list that crosses itself out in front of you reads as
 * subtraction, and the total spells out in words what the strike-through says in colour, so nothing here depends on
 * seeing a red line (P-03). Reduced motion gets the whole list already cut and the final total on first paint.
 *
 * The list is live: anything the prospect rejects in the audit disappears from here and the counter drops, so the
 * number is always theirs, never ours.
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stat } from '../../../components/molecule/Stat/Stat';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useCountUp, useInView, useLiveActions, usePrefersReducedMotion } from '../hooks';
import { usd } from '../format';
import { SectionShell } from './SectionShell';

type Sav = Extract<Section, { kind: 'savings_stack' }>;
/** The whole list crosses itself out inside ~1.1 s, so a full-page screenshot never catches it half done. */
const SEQUENCE_MS = 1100;

export function SavingsStack({ section }: { section: Sav }) {
  const { bi, t, lang } = useI18n();
  const { guesses, savings: live, openDemo, model, pageCode, track } = useLanding();
  const nav = useNavigate();
  const { slug } = useParams();
  const items = guesses.length ? live.items : section.savings.items;
  const totals = guesses.length ? live : section.savings;
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const reduced = usePrefersReducedMotion();
  const annual = useCountUp(Math.max(0, totals.net_annual), inView);

  // How many rows have been crossed off. The running total is derived from this, so the text and the strike-throughs
  // are the same state and can never disagree. The resting state is *finished* (like the count-up beside it): only a
  // section that started below the fold arms the sequence, so a viewer who lands mid-page, a reduced-motion viewer
  // and a full-page screenshot all see the completed list rather than a list that never crossed anything out.
  const [cut, setCut] = useState(items.length);
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top > window.innerHeight) { setArmed(true); setCut(0); }
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!armed || !inView) return;
    const step = Math.max(45, Math.min(150, SEQUENCE_MS / Math.max(1, items.length)));
    let i = 0;
    const tick = window.setInterval(() => { i += 1; setCut(i); if (i >= items.length) window.clearInterval(tick); }, step);
    const finish = window.setTimeout(() => { window.clearInterval(tick); setCut(items.length); }, step * items.length + 400);
    return () => { window.clearInterval(tick); window.clearTimeout(finish); };
  }, [armed, inView, items.length]);

  // "A number they can correct beats a number they must believe" (playbook 3). On the reveal, the walkthrough and
  // the letter the number is ours; one tap moves them to the audit archetype of the same page, where every line is
  // correctable. On the audit page itself the rows are already right there, so the link would be a loop.
  const correctable = model.archetype !== 'audit' && !!slug;
  const correctStack = () => {
    track('cta_click', { cta: 'correct_stack', action: 'landing.correctStack', section: section.id, from_archetype: model.archetype });
    nav(`/p/${slug}/audit`);
    return 'opening the audit page so the stack can be corrected';
  };
  useLiveActions(pageCode, { 'landing.correctStack': () => (correctable ? correctStack() : 'this page already lets you correct every line') });

  const cutCount = Math.min(armed ? cut : items.length, items.length);
  const cutSoFar = items.slice(0, cutCount).reduce((sum, g) => sum + g.monthly_cost, 0);

  return (
    <SectionShell id={section.id} kind="savings_stack" label={bi(section.headline)}>
      <div className="lp-head">
        <h2 className="lp-h2">{bi(section.headline)}</h2>
        <p className="lp-sub">{bi(section.sub)}</p>
      </div>
      <div className="lp-savings" ref={ref}>
        <div className="lp-stack">
          <ul className="lp-stack-list">
            {items.map((g, i) => (
              <li key={g.tool} className={`lp-stack-row ${i < cutCount ? 'is-cut' : ''}`}>
                <span className="lp-stack-tool">{g.tool}</span>
                <span className="lp-stack-cat">{g.category}</span>
                <span className="lp-stack-repl">{t('landing.replaced_by', { module: g.replaced_by })}</span>
                <span className="lp-stack-price"><s>{usd(g.monthly_cost, lang)}</s>{i < cutCount && <span className="sr-only"> {t('landing.cancelled')}</span>}</span>
                {g.status === 'confirmed' && <Badge tone="success" size="sm">{t('landing.confirmed')}</Badge>}
              </li>
            ))}
          </ul>
          <p className="lp-running" aria-live="polite">
            <strong>{t('landing.cut_running', { money: usd(cutSoFar, lang) })}</strong>
            <span>{t('landing.cut_progress', { done: cutCount, total: items.length })}</span>
          </p>
        </div>
        <div className="lp-savings-side">
          <Stat size="lg" label={t('landing.net_year')} value={usd(annual, lang)} hint={t('landing.vs_today', { now: usd(totals.monthly_current, lang), ours: usd(totals.our_price_monthly, lang) })} />
          <Stat label={t('landing.tools_cut')} value={totals.tools_cut} hint={t('landing.tools_cut_hint')} />
          <p className="lp-note">{t('landing.savings_note')}</p>
          <div className="lp-savings-actions">
            <Button variant="primary" icon="play" className="lp-btn-primary" onClick={() => openDemo(section.id)}>{t('landing.see_it_instead')}</Button>
            {correctable && <Button variant="ghost" size="sm" icon="edit" onClick={correctStack}>{t('landing.correct_stack')}</Button>}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
