/**
 * The letter archetype: a short note from a person, set over their own app. Only sent when a human has actually
 * spoken to them, so the voice stays true. The voice note is a Placeholder - recording it is a content pass (T50),
 * and a fake waveform would be the one dishonest thing on the page.
 */
import { Placeholder } from '../../../components/atom/Placeholder/Placeholder';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { SectionShell } from './SectionShell';
import { ExpiryLine } from './ExpiryLine';

type Letter = Extract<Section, { kind: 'letter' }>;

export function LetterSection({ section }: { section: Letter }) {
  const { bi, t } = useI18n();
  const { model, prospect, openDemo } = useLanding();
  return (
    <SectionShell id={section.id} kind="letter" label={bi(section.greeting)}>
      <div className="lp-letter">
        <div className="lp-letter-paper">
          <p className="lp-letter-greeting">{bi(section.greeting)}</p>
          {section.paragraphs.map((p, i) => <p key={i} className="lp-letter-p">{bi(p)}</p>)}
          <p className="lp-letter-signoff">{bi(section.signoff)}</p>
          <div className="lp-letter-from">
            <Avatar name={section.from} color={prospect.style.palette.primary} />
            <span>{section.from}</span>
          </div>
          <div className="lp-cta-row">
            <Button size="lg" variant="primary" icon="play" className="lp-btn-primary" onClick={() => openDemo(section.id)}>{bi(model.cta.primary.label)}</Button>
            <Placeholder will={`play the 40-second voice note from ${section.from}`} by="content pass (T50)" button={{ label: t('landing.play_note'), variant: 'outline', size: 'lg', icon: 'play' }} />
          </div>
          <ExpiryLine />
        </div>
      </div>
    </SectionShell>
  );
}
