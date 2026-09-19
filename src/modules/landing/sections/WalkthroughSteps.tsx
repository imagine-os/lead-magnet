/**
 * A pinned day-in-the-life story: the device sticks while the steps scroll past it, and the screen inside it changes
 * to the role whose scene you are reading. A progress rail shows where you are; prev / next buttons drive the same
 * state, so the story also works with a keyboard, a remote, or reduced motion where nothing animates at all.
 */
import { useEffect, useRef, useState } from 'react';
import { DeviceMockup } from '../../../components/molecule/DeviceMockup/DeviceMockup';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import { deriveRoleViews } from '../../../engine';
import type { RoleView, Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useLiveActions, useScrollTo } from '../hooks';
import { cap } from '../format';
import { SectionShell } from './SectionShell';
import { MiniOs } from './MiniOs';

type Steps = Extract<Section, { kind: 'walkthrough_steps' }>;

export function WalkthroughSteps({ section }: { section: Steps }) {
  const { bi, t } = useI18n();
  const { prospect, model, pageCode, bookCall } = useLanding();
  const rolesSection = model.sections.find((s) => s.kind === 'role_views') as Extract<Section, { kind: 'role_views' }> | undefined;
  const allViews: RoleView[] = rolesSection?.views ?? deriveRoleViews(prospect);
  const steps = section.steps;
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const scrollTo = useScrollTo();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        const i = Number((e.target as HTMLElement).dataset.step);
        if (!Number.isNaN(i)) setActive(i);
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    for (const el of stepRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [steps.length]);

  const go = (i: number) => {
    const next = Math.min(steps.length - 1, Math.max(0, i));
    setActive(next);
    scrollTo(stepRefs.current[next], 'center');
    return `step ${next + 1}: ${steps[next] ? bi(steps[next].title) : ''}`;
  };
  useLiveActions(pageCode, { 'landing.goToStep': (p) => go(Number(p?.step ?? 0)) });

  const current = steps[active];
  const viewIndex = Math.max(0, allViews.findIndex((v) => v.role === current?.role));

  return (
    <SectionShell id={section.id} kind="walkthrough_steps" label={bi(section.headline)}>
      <div className="lp-head"><h2 className="lp-h2">{bi(section.headline)}</h2></div>
      <div className="lp-story">
        <div className="lp-story-stage">
          <DeviceMockup kind="laptop" title={`${prospect.business_name} OS - ${current ? cap(current.role) : ''}`}>
            <MiniOs prospect={prospect} views={allViews} device="laptop" index={viewIndex} />
          </DeviceMockup>
          <div className="lp-story-now" aria-live="polite">
            <span className="lp-story-time">{current?.time}</span>
            <span className="lp-story-role">{current ? cap(current.role) : ''}</span>
          </div>
          <div className="lp-story-controls">
            <Button size="sm" variant="outline" icon="chevron-left" onClick={() => go(active - 1)} disabled={active === 0}>{t('landing.prev')}</Button>
            <span className="lp-story-count">{active + 1} / {steps.length}</span>
            <Button size="sm" variant="outline" iconRight="chevron-right" onClick={() => go(active + 1)} disabled={active >= steps.length - 1}>{t('landing.next')}</Button>
          </div>
        </div>
        <ol className="lp-story-steps">
          {steps.map((s, i) => (
            <li key={`${i}-${s.role}`} data-step={i} ref={(el) => { stepRefs.current[i] = el; }} className={`lp-story-step ${i === active ? 'is-active' : ''}`}>
              <div className="lp-story-rail" aria-hidden><span className="lp-story-tick" /></div>
              <div className="lp-story-copy">
                <p className="lp-eyebrow">{s.time} · {cap(s.role)}</p>
                <h3 className="lp-story-title">{bi(s.title)}</h3>
                <p className="lp-sub">{bi(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="lp-story-end">{t('landing.story_end')} <Button variant="link" onClick={() => bookCall(section.id)}>{bi(model.cta.secondary.label)}</Button></p>
    </SectionShell>
  );
}
