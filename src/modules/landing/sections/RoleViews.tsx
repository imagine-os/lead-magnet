/**
 * "Every role of the people in their life gets their own view" (playbook 5). One card per business and life role with
 * its three widgets as small themed panels. Scroll-snap carousel on a phone, grid from tablet up; arrow keys, Home /
 * End and the prev / next buttons all move between cards, so nothing here is swipe-only (P-03).
 *
 * Every card ends in "Try it as <role>", which opens the live demo already switched to that person's view
 * (`/demo/:id/role/:slug`). It is the primary CTA aimed one step deeper: the surprise of the section is that the
 * groomer and the spouse each get their own screen, and the fastest way to believe it is to stand in one.
 */
import { useRef, useState } from 'react';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge } from '../../../components/atom/Badge/Badge';
import { IconButton } from '../../../components/atom/IconButton/IconButton';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useLiveActions, useScrollTo } from '../hooks';
import { cap } from '../format';
import { SectionShell } from './SectionShell';
import { MiniWidget } from './MiniOs';

type Roles = Extract<Section, { kind: 'role_views' }>;

export function RoleViews({ section }: { section: Roles }) {
  const { bi, t } = useI18n();
  const { pageCode, openRole } = useLanding();
  const scrollTo = useScrollTo();
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const views = section.views;

  const focusCard = (i: number) => {
    const next = Math.min(views.length - 1, Math.max(0, i));
    setActive(next);
    const el = listRef.current?.querySelectorAll<HTMLElement>('[data-role-card]')[next];
    el?.focus();
    scrollTo(el, 'nearest');
  };
  const goToRole = (role: string) => {
    const i = views.findIndex((v) => v.role.toLowerCase() === String(role).toLowerCase());
    if (i < 0) return `no role view for "${role}"`;
    focusCard(i);
    return `showing the ${views[i].role} view`;
  };
  const tryRole = (role: string) => {
    const i = views.findIndex((v) => v.role.toLowerCase() === String(role).toLowerCase());
    if (i < 0) return `no role view for "${role}"`;
    openRole(section.id, views[i], views);
    return `opening the demo as the ${views[i].role}`;
  };
  useLiveActions(pageCode, {
    'landing.viewRole': (p) => goToRole(String(p?.role ?? '')),
    'landing.tryAsRole': (p) => tryRole(String(p?.role ?? views[active]?.role ?? '')),
  });

  return (
    <SectionShell id={section.id} kind="role_views" label={bi(section.headline)}>
      <div className="lp-head">
        <h2 className="lp-h2">{bi(section.headline)}</h2>
        <p className="lp-sub">{bi(section.sub)}</p>
        <div className="lp-roles-nav">
          <IconButton icon="chevron-left" label={t('landing.prev_role')} variant="outline" onClick={() => focusCard(active - 1)} disabled={active === 0} />
          <span className="lp-roles-count" aria-live="polite">{active + 1} / {views.length}</span>
          <IconButton icon="chevron-right" label={t('landing.next_role')} variant="outline" onClick={() => focusCard(active + 1)} disabled={active >= views.length - 1} />
        </div>
      </div>
      <ul className="lp-roles" ref={listRef}>
        {views.map((v, i) => (
          <li key={`${v.kind}-${v.role}`} className="lp-role-item">
            <Card
              className={`lp-role ${i === active ? 'is-active' : ''}`}
              data-role-card=""
              tabIndex={0}
              aria-label={`${cap(v.role)} - ${bi(v.headline)}`}
              onFocus={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); focusCard(i + 1); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); focusCard(i - 1); }
                if (e.key === 'Home') { e.preventDefault(); focusCard(0); }
                if (e.key === 'End') { e.preventDefault(); focusCard(views.length - 1); }
              }}
            >
              <div className="lp-role-head">
                <span className="lp-role-name">{cap(v.role)}</span>
                <Badge tone={v.kind === 'life' ? 'accent' : 'primary'} size="sm">{v.kind === 'life' ? t('landing.role_life') : t('landing.role_business')}</Badge>
              </div>
              <p className="lp-role-headline">{bi(v.headline)}</p>
              <div className="lp-role-widgets">{v.widgets.map((w) => <MiniWidget key={w.id} widget={w} />)}</div>
              <Button
                variant="outline" size="sm" iconRight="arrow-right" className="lp-btn-secondary lp-role-try"
                title={t('landing.try_as_role_hint')}
                onClick={() => openRole(section.id, v, views)}
              >{t('landing.try_as_role', { role: cap(v.role) })}</Button>
            </Card>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
