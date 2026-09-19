/**
 * "Every role of the people in their life gets their own view" (playbook 5). One card per business and life role with
 * its three widgets as small themed panels. Scroll-snap carousel on a phone, grid from tablet up; arrow keys, Home /
 * End and the prev / next buttons all move between cards, so nothing here is swipe-only (P-03).
 *
 * Every card ends in two things:
 *  - "Try it as <role>", which opens the live demo already switched to that person's view (`/demo/:id/role/:slug`).
 *    It is the primary CTA aimed one step deeper: the surprise of the section is that the groomer and the spouse each
 *    get their own screen, and the fastest way to believe it is to stand in one.
 *  - "Send the <role> view", which copies that same link. The prospect is rarely the only decision-maker, and a link
 *    to *the manager's screen* is a far better forward than a link to a page about software (pass 3). The clipboard
 *    API is best-effort: whether it worked or not, the link appears in a selected, read-only field underneath, so a
 *    browser that refuses the clipboard still leaves the viewer one Ctrl/Cmd+C away.
 */
import { useId, useRef, useState } from 'react';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge } from '../../../components/atom/Badge/Badge';
import { IconButton } from '../../../components/atom/IconButton/IconButton';
import { Button } from '../../../components/atom/Button/Button';
import { Input } from '../../../components/atom/Input/Input';
import { useI18n } from '../../../i18n/I18nProvider';
import type { RoleView, Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useLiveActions, useScrollTo } from '../hooks';
import { cap, viewSlug } from '../format';
import { copyText, roleShareUrl } from '../share';
import { SectionShell } from './SectionShell';
import { MiniWidget } from './MiniOs';

type Roles = Extract<Section, { kind: 'role_views' }>;
interface ShareState { role: string; url: string; copied: boolean }

export function RoleViews({ section }: { section: Roles }) {
  const { bi, t } = useI18n();
  const { pageCode, prospect, openRole, track } = useLanding();
  const scrollTo = useScrollTo();
  const listRef = useRef<HTMLUListElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const shareId = useId();
  const [active, setActive] = useState(0);
  const [share, setShare] = useState<ShareState | null>(null);
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

  /** Copy the deep link to one role's demo view; the field below is the fallback and the confirmation at once. */
  const shareRole = async (v: RoleView) => {
    const url = roleShareUrl(prospect.id, viewSlug(v, views));
    const copied = await copyText(url);
    setShare({ role: v.role, url, copied });
    track('cta_click', { cta: 'share_role', action: 'landing.shareRole', section: section.id, role: v.role, role_kind: v.kind, copied });
    // Focus and select either way: it confirms what was copied, and it is the whole fallback when the copy failed.
    window.setTimeout(() => { urlRef.current?.focus(); urlRef.current?.select(); }, 0);
    return copied ? `copied the ${v.role} view link` : `the ${v.role} view link is selected, press Ctrl/Cmd+C`;
  };
  const shareByName = async (role: string) => {
    const i = views.findIndex((v) => v.role.toLowerCase() === String(role).toLowerCase());
    if (i < 0) return `no role view for "${role}"`;
    focusCard(i);
    return shareRole(views[i]);
  };

  useLiveActions(pageCode, {
    'landing.viewRole': (p) => goToRole(String(p?.role ?? '')),
    'landing.tryAsRole': (p) => tryRole(String(p?.role ?? views[active]?.role ?? '')),
    'landing.shareRole': (p) => shareByName(String(p?.role ?? views[active]?.role ?? '')),
  });

  return (
    <SectionShell id={section.id} kind="role_views" label={bi(section.headline)}>
      <div className="lp-head">
        <h2 className="lp-h2">{bi(section.headline)}</h2>
        <p className="lp-sub">{bi(section.sub)}</p>
        <p className="lp-note">{t('landing.share_intro')}</p>
        <div className="lp-roles-nav">
          <IconButton icon="chevron-left" label={t('landing.prev_role')} variant="outline" onClick={() => focusCard(active - 1)} disabled={active === 0} />
          <span className="lp-roles-count" aria-live="polite">{active + 1} / {views.length}</span>
          <IconButton icon="chevron-right" label={t('landing.next_role')} variant="outline" onClick={() => focusCard(active + 1)} disabled={active >= views.length - 1} />
        </div>
      </div>
      <ul className="lp-roles" ref={listRef} data-spatial="skip">
        {views.map((v, i) => {
          const open = share?.role === v.role;
          return (
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
                <div className="lp-role-actions">
                  <Button
                    variant="outline" size="sm" iconRight="arrow-right" className="lp-btn-secondary lp-role-try"
                    title={t('landing.try_as_role_hint')}
                    onClick={() => openRole(section.id, v, views)}
                  >{t('landing.try_as_role', { role: cap(v.role) })}</Button>
                  <Button
                    variant="ghost" size="sm" icon="link" className="lp-role-share"
                    aria-expanded={open}
                    title={t('landing.share_role_hint')}
                    onClick={() => void shareRole(v)}
                  >{t('landing.share_role', { role: cap(v.role) })}</Button>
                </div>
                {open && share && (
                  <div className="lp-share">
                    <label className="lp-share-label" htmlFor={`${shareId}-url`}>{share.copied ? t('landing.share_copied', { role: cap(v.role) }) : t('landing.share_manual')}</label>
                    <Input id={`${shareId}-url`} ref={urlRef} className="lp-share-url" readOnly value={share.url} spellCheck={false} onFocus={(e) => e.currentTarget.select()} />
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
