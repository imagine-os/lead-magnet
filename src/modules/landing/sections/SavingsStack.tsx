/**
 * Loss aversion with a concrete number (playbook 3). Their guessed stack, one row per tool, each price struck through
 * as the row scrolls in, and the annual saving counting up. The list is live: anything the prospect rejects in the
 * audit disappears from here and the counter drops, so the number is always theirs, never ours.
 */
import { Stat } from '../../../components/molecule/Stat/Stat';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import { savings as computeSavings } from '../../../engine';
import type { Section, StackGuess } from '../../../engine/types';
import { useLanding } from '../context';
import { useCountUp, useInView } from '../hooks';
import { usd } from '../format';
import { SectionShell } from './SectionShell';

type Sav = Extract<Section, { kind: 'savings_stack' }>;

export function SavingsStack({ section }: { section: Sav }) {
  const { bi, t, lang } = useI18n();
  const { prospect, guesses, openDemo } = useLanding();
  const live = guesses.length ? computeSavings(prospect, guesses as unknown as StackGuess[]) : section.savings;
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const annual = useCountUp(Math.max(0, live.net_annual), inView);
  const items = live.items;

  return (
    <SectionShell id={section.id} kind="savings_stack" label={bi(section.headline)}>
      <div className="lp-head">
        <h2 className="lp-h2">{bi(section.headline)}</h2>
        <p className="lp-sub">{bi(section.sub)}</p>
      </div>
      <div className="lp-savings" ref={ref}>
        <ul className="lp-stack-list">
          {items.map((g, i) => (
            <li key={g.tool} className={`lp-stack-row ${inView ? 'is-cut' : ''}`} style={{ ['--lp-delay' as string]: String(0.06 * i) }}>
              <span className="lp-stack-tool">{g.tool}</span>
              <span className="lp-stack-cat">{g.category}</span>
              <span className="lp-stack-repl">{t('landing.replaced_by', { module: g.replaced_by })}</span>
              <span className="lp-stack-price"><s>{usd(g.monthly_cost, lang)}</s><span className="sr-only">{t('landing.cancelled')}</span></span>
              {g.status === 'confirmed' && <Badge tone="success" size="sm">{t('landing.confirmed')}</Badge>}
            </li>
          ))}
        </ul>
        <div className="lp-savings-side">
          <Stat size="lg" label={t('landing.net_year')} value={usd(annual, lang)} hint={t('landing.vs_today', { now: usd(live.monthly_current, lang), ours: usd(live.our_price_monthly, lang) })} />
          <Stat label={t('landing.tools_cut')} value={live.tools_cut} hint={t('landing.tools_cut_hint')} />
          <p className="lp-note">{t('landing.savings_note')}</p>
          <Button variant="primary" icon="play" className="lp-btn-primary" onClick={() => openDemo(section.id)}>{t('landing.see_it_instead')}</Button>
        </div>
      </div>
    </SectionShell>
  );
}
