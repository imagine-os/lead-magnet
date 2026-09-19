/** One renderer per Section kind. The union is exhaustive: a new kind in the engine fails the build here, on purpose. */
import type { Section } from '../../../engine/types';
import { HeroReveal } from './HeroReveal';
import { SavingsStack } from './SavingsStack';
import { RoleViews } from './RoleViews';
import { WalkthroughSteps } from './WalkthroughSteps';
import { StackAudit } from './StackAudit';
import { ProofSection } from './Proof';
import { LetterSection } from './Letter';
import { FaqSection } from './Faq';
import { CtaBand } from './CtaBand';
import { BookingInline } from './BookingInline';

export function renderSection(section: Section) {
  switch (section.kind) {
    case 'hero_reveal': return <HeroReveal key={section.id} section={section} />;
    case 'savings_stack': return <SavingsStack key={section.id} section={section} />;
    case 'role_views': return <RoleViews key={section.id} section={section} />;
    case 'walkthrough_steps': return <WalkthroughSteps key={section.id} section={section} />;
    case 'stack_audit': return <StackAudit key={section.id} section={section} />;
    case 'proof': return <ProofSection key={section.id} section={section} />;
    case 'letter': return <LetterSection key={section.id} section={section} />;
    case 'faq': return <FaqSection key={section.id} section={section} />;
    case 'cta_band': return <CtaBand key={section.id} section={section} />;
    case 'booking_inline': return <BookingInline key={section.id} section={section} />;
    default: {
      const never: never = section;
      return never;
    }
  }
}
export { HeroReveal, SavingsStack, RoleViews, WalkthroughSteps, StackAudit, ProofSection, LetterSection, FaqSection, CtaBand, BookingInline };
