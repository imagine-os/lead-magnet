/**
 * Proof that it is theirs (playbook 5): every card is a fact about this prospect that the engine already knows.
 * The testimonial and logo strip are honestly labelled as samples - we do not have customer quotes yet, and a
 * fabricated one would be the fastest way to lose the call. "See the case study" is a Placeholder until we have one.
 */
import { Card } from '../../../components/molecule/Card/Card';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Placeholder } from '../../../components/atom/Placeholder/Placeholder';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { SectionShell } from './SectionShell';

type Proof = Extract<Section, { kind: 'proof' }>;

export function ProofSection({ section }: { section: Proof }) {
  const { bi, t } = useI18n();
  const { prospect } = useLanding();
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
        <div className="lp-logos" aria-label={t('landing.sample_logos')}>
          {['A', 'B', 'C', 'D', 'E'].map((l) => <span key={l} className="lp-logo" aria-hidden>{l}</span>)}
        </div>
        <p className="lp-note">{t('landing.sample_logos_note')}</p>
        <Placeholder will="open the full case study for a business like this one" by="content pass (T50)" button={{ label: t('landing.see_case'), variant: 'outline', size: 'sm' }} />
      </div>
    </SectionShell>
  );
}
