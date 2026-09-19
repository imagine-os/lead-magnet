/**
 * Proof that it is theirs (playbook 5): every card is a fact about this prospect that the engine already knows.
 *
 * Pass 3 splits the section in two, because "proof" was doing two different jobs badly. The cards stay as they were.
 * Under them, what used to be a strip of five invented logo marks is now **three things the viewer can check in the
 * next two minutes** - the live demo, the correctable stack, the real expiry - each one a claim that falls apart if
 * it is not true, which is the only kind of proof we have earned. The sample quote stays, still labelled as
 * illustrative and not a customer, and "See the case study" stays a Placeholder until there is one (P-09).
 */
import { Card } from '../../../components/molecule/Card/Card';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Icon } from '../../../components/atom/Icon/Icon';
import { Placeholder } from '../../../components/atom/Placeholder/Placeholder';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { SectionShell } from './SectionShell';
import { useExpiry } from './ExpiryLine';

type Proof = Extract<Section, { kind: 'proof' }>;

export function ProofSection({ section }: { section: Proof }) {
  const { bi, t } = useI18n();
  const { prospect, savings } = useLanding();
  const expiry = useExpiry();

  const checkable: { icon: 'play' | 'edit' | 'calendar'; text: string }[] = [
    { icon: 'play', text: t('landing.check_demo') },
    { icon: 'edit', text: t('landing.check_stack', { tools: savings.items.length }) },
    { icon: 'calendar', text: expiry ? t('landing.check_expiry', { date: expiry.date }) : t('landing.check_expiry_none') },
  ];

  return (
    <SectionShell id={section.id} kind="proof" label={bi(section.headline)}>
      <div className="lp-head"><h2 className="lp-h2">{bi(section.headline)}</h2></div>
      <div className="lp-proof">
        {section.items.map((it) => (
          <Card key={it.title.en} className="lp-proof-card">
            <h3 className="lp-proof-title">{bi(it.title)}</h3>
            <p className="lp-sub">{bi(it.body)}</p>
          </Card>
        ))}
      </div>

      <div className="lp-checkable">
        <h3 className="lp-proof-title">{t('landing.check_head')}</h3>
        <ul className="lp-check-list">
          {checkable.map((c) => (
            <li key={c.text} className="lp-check"><Icon name={c.icon} size={20} /><span>{c.text}</span></li>
          ))}
        </ul>
      </div>

      <div className="lp-proof-sample" aria-label={t('landing.sample_head')}>
        <div className="lp-proof-sample-head">
          <Badge tone="warn" size="sm">{t('landing.sample_badge')}</Badge>
          <strong className="lp-sample-title">{t('landing.sample_head')}</strong>
          <span className="xs">{t('landing.sample_note')}</span>
        </div>
        <blockquote className="lp-quote">
          <p>{t('landing.sample_quote')}</p>
          <footer className="xs">{t('landing.sample_author', { industry: prospect.industry.replace(/_/g, ' ') })}</footer>
        </blockquote>
        <Placeholder will="open the full case study for a business like this one" by="content pass (T50)" button={{ label: t('landing.see_case'), variant: 'outline', size: 'sm' }} />
      </div>
    </SectionShell>
  );
}
