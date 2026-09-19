/**
 * Above the fold (R-C03): their name, their business, their city, their palette - and their OS already running on a
 * phone, a laptop and the office TV.
 *
 * The phone and the laptop play a real frame sequence captured from the live demo (`npm run frames`), scrubbed by the
 * hero's own scroll progress: frame 0 when you arrive, the last frame as the hero leaves. That is the one thing a
 * screenshot cannot fake (playbook 6), and it is the product itself rather than a render of it. When no sequence has
 * been generated for this prospect, every device falls back to the live <MiniOs> composition and nothing else
 * changes. Reduced motion holds the first frame and the devices are visible on first paint (P-03).
 *
 * The two strongest personal facts sit directly under the headline: where they are (city, locations, team) and the
 * thing their industry loses weeks to, straight from the catalog. If the hero could be anyone's, it converts like
 * anyone's (playbook 4).
 */
import { DeviceMockup } from '../../../components/molecule/DeviceMockup/DeviceMockup';
import { Button } from '../../../components/atom/Button/Button';
import { Icon } from '../../../components/atom/Icon/Icon';
import { useI18n } from '../../../i18n/I18nProvider';
import { deriveRoleViews, industry } from '../../../engine';
import type { RoleView, Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useFrames, useScrollFrames } from '../hooks';
import { SectionShell } from './SectionShell';
import { ExpiryLine } from './ExpiryLine';
import { MiniOs } from './MiniOs';

type Hero = Extract<Section, { kind: 'hero_reveal' }>;
const LABEL: Record<'phone' | 'laptop' | 'tv', { en: string; es: string }> = {
  phone: { en: 'On the floor', es: 'En el piso' }, laptop: { en: 'In the office', es: 'En la oficina' }, tv: { en: 'On the back-office TV', es: 'En la TV de la oficina' },
};
/** Frames are 24 (phone) / 12 (laptop) when they exist; 12 keeps the CSS-composition fallback exactly as it was. */
const FALLBACK_FRAMES = 12;

export function HeroReveal({ section }: { section: Hero }) {
  const { bi, t } = useI18n();
  const { prospect, model, openDemo, bookCall } = useLanding();
  const frames = useFrames(prospect.id);
  const { ref, frame, progress, reduced } = useScrollFrames<HTMLDivElement>(frames ? frames.phone.length : FALLBACK_FRAMES);
  const rolesSection = model.sections.find((s) => s.kind === 'role_views') as Extract<Section, { kind: 'role_views' }> | undefined;
  const views: RoleView[] = rolesSection?.views ?? deriveRoleViews(prospect);
  const devices = section.devices.length ? section.devices : (['phone', 'laptop', 'tv'] as const).slice();
  const ind = industry(prospect.industry);
  const pain = ind.pains[0];

  /** The image for a device at this scroll position, or null when the device keeps the live composition. */
  const frameFor = (d: 'phone' | 'laptop' | 'tv'): { src: string; alt: string } | null => {
    if (!frames) return null;
    const list = d === 'phone' ? frames.phone : d === 'laptop' ? frames.desk : [];
    const labels = d === 'phone' ? frames.labels : frames.deskLabels;
    if (!list.length) return null;
    const i = Math.min(list.length - 1, Math.round((frame / Math.max(1, (frames.phone.length - 1))) * (list.length - 1)));
    return { src: list[i], alt: t('landing.frames_alt', { business: prospect.business_name, n: i + 1, total: list.length, label: labels[i] ?? '' }) };
  };

  return (
    <SectionShell id={section.id} kind="hero_reveal" label={bi(section.headline)}>
      <div className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">{bi(section.eyebrow)}</p>
          <h1 className="lp-h1">{bi(section.headline)}</h1>
          <p className="lp-lede">{bi(section.sub)}</p>
          <ul className="lp-facts" aria-label={t('landing.facts_label')}>
            <li className="lp-fact"><Icon name="map" size={18} /><span>{prospect.locations > 1
              ? t('landing.fact_place_multi', { city: prospect.city, locations: prospect.locations, team: prospect.team_size })
              : t('landing.fact_place', { city: prospect.city, team: prospect.team_size })}</span></li>
            {pain && <li className="lp-fact"><Icon name="alert" size={18} /><span>{t('landing.fact_pain', { pain: bi(pain) })}</span></li>}
          </ul>
          <div className="lp-cta-row">
            <Button size="lg" variant="primary" icon="play" className="lp-btn-primary" onClick={() => openDemo(section.id)}>{bi(model.cta.primary.label)}</Button>
            <Button size="lg" variant="outline" icon="calendar" className="lp-btn-secondary" onClick={() => bookCall(section.id)}>{bi(model.cta.secondary.label)}</Button>
          </div>
          <ExpiryLine />
          <p className="lp-hero-meta">{t('landing.hero_meta', { business: section.businessName, city: section.city })}</p>
        </div>
        <div className="lp-hero-devices" ref={ref} data-frame={frame} data-frames={frames ? frames.phone.length : FALLBACK_FRAMES} data-source={frames ? 'frames' : 'live'} style={{ ['--lp-progress' as string]: reduced ? '1' : String(progress) }}>
          {devices.map((d, i) => {
            const img = frameFor(d);
            return (
              <figure key={d} className={`lp-device lp-device-${d}`} style={{ ['--lp-delay' as string]: String(i * 0.12) }}>
                <DeviceMockup kind={d} title={img ? img.alt : `${section.businessName} OS - ${bi(LABEL[d])}`} imageSrc={img?.src}>
                  {img ? null : <MiniOs prospect={prospect} views={views} device={d} index={frame + i} />}
                </DeviceMockup>
                <figcaption className="lp-device-cap">{bi(LABEL[d])}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
