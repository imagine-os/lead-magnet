/**
 * Above the fold (R-C03): their name, their business, their city, their palette - and their OS already running on a
 * phone, a laptop and the office TV. The three frames are revealed by scroll progress through `useScrollFrames`, the
 * same hook a generated frame sequence will drive when the assets exist (T41); reduced motion shows the final frame.
 */
import { DeviceMockup } from '../../../components/molecule/DeviceMockup/DeviceMockup';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import { deriveRoleViews } from '../../../engine';
import type { RoleView, Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useScrollFrames } from '../hooks';
import { SectionShell } from './SectionShell';
import { MiniOs } from './MiniOs';

type Hero = Extract<Section, { kind: 'hero_reveal' }>;
const LABEL: Record<'phone' | 'laptop' | 'tv', { en: string; es: string }> = {
  phone: { en: 'On the floor', es: 'En el piso' }, laptop: { en: 'In the office', es: 'En la oficina' }, tv: { en: 'On the back-office TV', es: 'En la TV de la oficina' },
};

export function HeroReveal({ section }: { section: Hero }) {
  const { bi, t } = useI18n();
  const { prospect, model, openDemo, bookCall } = useLanding();
  // 12 frames: enough for a smooth reveal today, the right granularity for a frame sequence tomorrow.
  const { ref, frame, frames, progress, reduced } = useScrollFrames<HTMLDivElement>(12);
  const rolesSection = model.sections.find((s) => s.kind === 'role_views') as Extract<Section, { kind: 'role_views' }> | undefined;
  const views: RoleView[] = rolesSection?.views ?? deriveRoleViews(prospect);
  const devices = section.devices.length ? section.devices : (['phone', 'laptop', 'tv'] as const).slice();

  return (
    <SectionShell id={section.id} kind="hero_reveal" label={bi(section.headline)}>
      <div className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">{bi(section.eyebrow)}</p>
          <h1 className="lp-h1">{bi(section.headline)}</h1>
          <p className="lp-lede">{bi(section.sub)}</p>
          <div className="lp-cta-row">
            <Button size="lg" variant="primary" icon="play" className="lp-btn-primary" onClick={() => openDemo(section.id)}>{bi(model.cta.primary.label)}</Button>
            <Button size="lg" variant="outline" icon="calendar" className="lp-btn-secondary" onClick={() => bookCall(section.id)}>{bi(model.cta.secondary.label)}</Button>
          </div>
          <p className="lp-hero-meta">{t('landing.hero_meta', { business: section.businessName, city: section.city })}</p>
        </div>
        <div className="lp-hero-devices" ref={ref} data-frame={frame} data-frames={frames} style={{ ['--lp-progress' as string]: reduced ? '1' : String(progress) }}>
          {devices.map((d, i) => (
            <figure key={d} className={`lp-device lp-device-${d}`} style={{ ['--lp-delay' as string]: String(i * 0.12) }}>
              <DeviceMockup kind={d} title={`${section.businessName} OS - ${bi(LABEL[d])}`}>
                <MiniOs prospect={prospect} views={views} device={d} index={frame + i} />
              </DeviceMockup>
              <figcaption className="lp-device-cap">{bi(LABEL[d])}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
