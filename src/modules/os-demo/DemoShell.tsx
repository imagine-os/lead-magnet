/**
 * C-01 chrome: the prospect's own operating system. Its own shell (no DesktopShell): sidebar on desktop, bottom nav on
 * phone, 10-foot layout at >= 1920. Themed from the prospect palette via prospectStyle (R-D01) and by mapping the
 * design tokens the library components use onto --lp-*, so Card / Button / DataTable are theirs without being forked.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDefaultLang, useI18n } from '../../i18n/I18nProvider';
import { useRow, useTable } from '../../data/DataContext';
import type { PageRow, ProspectRow } from '../../data/schema/core';
import { deriveRoleViews, industryFor } from '../../engine';
import type { Industry, Prospect, RoleView } from '../../engine/types';
import { prospectStyle } from '../../design/tokens';
import { track, trackOnce } from '../../tracking';
import { useActions } from '../../actions';
import { useGamepadNav, useSpatialNav } from '../../a11y';
import { Button } from '../../components/atom/Button/Button';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Field } from '../../components/molecule/Field/Field';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { Modal } from '../../components/organism/Modal/Modal';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { personFor, roleSlug, titleCase, viewSlug, findView } from './people';
import { useDemoScale } from './useDemoScale';
import './demo.css';

export type SectionKey = 'home' | 'departments' | 'comms' | 'money' | 'life' | 'settings';

/** Module-scope so a role switch that changes route (C-01 -> C-02) is still counted once, and only once. */
const lastRoleSeen: Record<string, string> = {};

export interface Demo {
  prospect: Prospect; pageId: string | null; ind: Industry;
  views: RoleView[]; biz: RoleView[]; life: RoleView[];
  activeRole: string; activeView: RoleView | null; base: string;
  ctx: { page_id: string | null; prospect_id: string | null };
  /** Navigate by role name or slug (bus / voice). Business wins a name collision; use `goView` for an exact view. */
  goRole: (role: string) => void; /** Navigate to exactly this view (unique per kind + role). */ goView: (v: RoleView) => void; go: (section: SectionKey) => void; openSave: () => void; book: () => void;
}

const NAV: { key: SectionKey; icon: IconName; k: string }[] = [
  { key: 'home', icon: 'home', k: 'demo.nav_home' }, { key: 'departments', icon: 'layers', k: 'demo.nav_depts' }, { key: 'comms', icon: 'message', k: 'demo.nav_comms' },
  { key: 'money', icon: 'dollar', k: 'demo.nav_money' }, { key: 'life', icon: 'heart', k: 'demo.nav_life' }, { key: 'settings', icon: 'settings', k: 'demo.nav_settings' },
];

export function DemoShell({ code, section, children }: { code: string; section: SectionKey; children: (d: Demo) => ReactNode }) {
  const { prospectId, role: roleParam } = useParams();
  const { t, bi } = useI18n();
  const nav = useNavigate();
  const toast = useToast();
  const prospect = useRow<ProspectRow>('prospects', prospectId);
  const { rows: pages } = useTable<PageRow>('pages', prospectId ? { where: { prospect_id: prospectId } } : { where: { prospect_id: '—' } });
  const pageId = pages[0]?.id ?? null;
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null); // set only when the clipboard refuses: the link is then shown to copy by hand
  const [roleOpen, setRoleOpen] = useState(false); // phone: the role switcher lives in a sheet (top bar is one row under 600 px)
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const root = useRef<HTMLDivElement>(null); const spatial = useSpatialNav(root); useGamepadNav(spatial); // P-04: their OS on a TV remote
  const shareRef = useRef<HTMLInputElement>(null);
  const scale = useDemoScale(); // Icon takes a px size, so the chrome's icons grow with the 10-foot bands (P-01)
  useDefaultLang(prospect?.lang); // their OS opens in their language unless the viewer chose one (P-13)

  const views = useMemo(() => (prospect ? deriveRoleViews(prospect) : []), [prospect]);
  const biz = views.filter((v) => v.kind === 'business');
  const life = views.filter((v) => v.kind === 'life');
  const activeView = useMemo(() => (roleParam ? findView(views, roleParam) : null) ?? biz[0] ?? views[0] ?? null, [roleParam, views, biz]);
  const activeRole = activeView?.role ?? '';
  const base = `/demo/${prospectId ?? ''}`;
  const ctx = { page_id: pageId, prospect_id: prospectId ?? null };

  useEffect(() => { if (prospect) trackOnce(`demo_open|${prospect.id}`, 'demo_open', { role: activeRole || null, section }, ctx); }, [prospect?.id, pageId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (prospect) trackOnce(`section|${code}`, 'section_view', { section: code, page: section }, ctx); }, [prospect?.id, pageId, code]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!prospect || !activeRole) return;
    const prev = lastRoleSeen[prospect.id];
    if (prev && prev !== activeRole) void track('demo_role_switch', { role: activeRole, from: prev }, ctx);
    lastRoleSeen[prospect.id] = activeRole;
  }, [activeRole, prospect?.id, pageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const goView = (v: RoleView) => { setRoleOpen(false); nav(`${base}/role/${viewSlug(v, views)}`); };
  const goRole = (r: string) => { const v = findView(views, r) ?? views.find((x) => x.role === r); if (v) goView(v); else nav(`${base}/role/${roleSlug(r)}`); };
  const go = (s: SectionKey) => nav(s === 'home' ? `${base}/role/${activeView ? viewSlug(activeView, views) : roleSlug(activeRole)}` : `${base}/${s}`);
  const openSave = () => { void track('cta_click', { cta: 'save_workspace', section: code }, ctx); setSaveOpen(true); };
  const book = () => { void track('cta_click', { cta: 'book_walkthrough', section: code }, ctx); nav(`/book/${prospectId ?? ''}`); };
  /** The deep link of what is on screen: the role view on home (D-037), the section path everywhere else. */
  const sharePath = () => (section === 'home'
    ? `${base}/role/${activeView ? viewSlug(activeView, views) : roleSlug(activeRole)}`
    : `${base}/${section}`);
  const shareView = async () => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${sharePath()}`;
    void track('cta_click', { cta: 'share_view', role: activeRole, section: code }, ctx);
    try {
      await navigator.clipboard.writeText(url);
      setShareUrl(null);
      toast.push({ tone: 'success', title: t('demo.share_copied'), body: url });
    } catch {
      setShareUrl(url); // visible fallback: the bar under the top bar shows the link, selected, to copy by hand
      toast.push({ tone: 'warn', title: t('demo.share_manual'), body: t('demo.share_manual_body') });
    }
    return url;
  };
  useEffect(() => { if (shareUrl) { shareRef.current?.focus(); shareRef.current?.select(); } }, [shareUrl]);
  const submitSave = () => {
    void track('form_submit', { form: 'save_workspace', has_name: !!name.trim(), has_email: !!email.trim(), section: code }, ctx);
    setSaved(true); setSaveOpen(false);
    toast.push({ tone: 'success', title: t('demo.save_done'), body: t('demo.save_done_body') });
  };
  useActions(code, {
    'demo.switchRole': (p) => goRole(String(p?.role ?? '')),
    'demo.saveWorkspace': () => openSave(),
    'demo.bookCall': () => book(),
    'demo.goto': (p) => go((String(p?.section ?? 'home') as SectionKey)),
    'demo.shareView': () => shareView(),
  });

  if (!prospectId || !prospect) return (
    <div className="demo demo-empty">
      <EmptyState icon="search" title={t('demo.unknown_title')} body={t('demo.unknown_body')} action={<Link to="/"><Button variant="primary" icon="home">{t('demo.to_hub')}</Button></Link>} />
    </div>
  );

  const ind = industryFor(prospect); // the industry as this prospect experiences it: a sub-industry's departments, KPIs, pains, roles and meter win (T55 / T62)
  const d: Demo = { prospect, pageId, ind, views, biz, life, activeRole, activeView, base, ctx, goRole, goView, go, openSave, book };
  const me = personFor(prospect, activeRole || 'owner');
  // Option values are the unique view slugs ("owner" exists as a business AND a life role), never the bare role name.
  const roleOptions = [
    ...biz.map((v) => ({ value: viewSlug(v, views), label: `${t('demo.group_biz')} · ${titleCase(v.role)}` })),
    ...life.map((v) => ({ value: viewSlug(v, views), label: `${t('demo.group_life')} · ${titleCase(v.role)}` })),
  ];
  const activeSlug = activeView ? viewSlug(activeView, views) : '';

  return (
    <div className="demo" ref={root} style={prospectStyle(prospect.style.palette, prospect.style.font)} data-demo-section={section}>
      <a href="#demo-main" className="demo-skip">{t('demo.skip')}</a>
      <header className="demo-top">
        {/* >= 600 px: one row with the role Select, EN | ES and both CTAs. Under 600 px: one 44 px row (wordmark, "Viewing as <role>"
            opening a sheet, compact EN/ES) plus a second row of two 44 px CTAs; about 108 px of chrome instead of four wrapped rows. */}
        <div className="demo-top-row">
          <Link to={`${base}/role/${biz[0] ? viewSlug(biz[0], views) : roleSlug(activeRole)}`} className="demo-wordmark">
            <span className="demo-mark" aria-hidden>{prospect.business_name.slice(0, 1)}</span>
            <span className="demo-wordmark-text"><span className="demo-biz">{prospect.business_name}</span><span className="demo-sub">{prospect.city} · {bi(ind.label)}</span></span>
          </Link>
          <div className="demo-top-spacer" />
          <div className="demo-role">
            <Avatar name={me.name} color={me.color} size="sm" />
            <Field label={t('demo.viewing_as')} inline>
              <Select options={roleOptions} value={activeSlug} onChange={(e) => goRole(e.target.value)} />
            </Field>
          </div>
          <Button size="sm" variant="outline" icon="user" className="demo-rolebtn" onClick={() => setRoleOpen(true)} aria-haspopup="dialog" aria-expanded={roleOpen}>
            <span className="sr-only">{t('demo.viewing_as')} </span>{titleCase(activeRole)}
          </Button>
          <span className="demo-lang-full"><LangToggle size="sm" /></span>
          <span className="demo-lang-compact"><LangToggle size="sm" compact /></span>
          <div className="demo-cta">
            <Button size="sm" variant="ghost" icon="link" className="demo-share" aria-label={t('demo.share')} title={t('demo.share')} onClick={() => void shareView()}>{t('demo.share')}</Button>
            <Button size="sm" variant="ghost" icon="calendar" onClick={book}>{t('demo.book')}</Button>
            <Button size="sm" variant="primary" icon={saved ? 'check' : 'heart'} onClick={openSave}>{saved ? t('demo.saved') : t('demo.save')}</Button>
          </div>
        </div>
        {shareUrl && (
          <div className="demo-sharebar">
            <Field label={t('demo.share_manual')} hint={t('demo.share_manual_body')}>
              <Input ref={shareRef} readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} />
            </Field>
            <Button size="sm" variant="ghost" icon="close" onClick={() => setShareUrl(null)}>{t('demo.share_close')}</Button>
          </div>
        )}
      </header>
      <Drawer open={roleOpen} onClose={() => setRoleOpen(false)} title={t('demo.viewing_as')} width={360}>
        <div className="stack demo-rolesheet">
          {[{ k: 'demo.group_biz', list: biz }, { k: 'demo.group_life', list: life }].map((g) => g.list.length > 0 && (
            <div key={g.k} className="stack demo-rolegroup">
              <div className="eyebrow">{t(g.k)}</div>
              {g.list.map((v) => { const on = activeView === v; return (
                <Button key={`${v.kind}-${v.role}`} block variant={on ? 'primary' : 'ghost'} icon={on ? 'check' : 'user'} aria-current={on ? 'true' : undefined} className="demo-roleopt" onClick={() => goView(v)}>{titleCase(v.role)}</Button>
              ); })}
            </div>
          ))}
        </div>
      </Drawer>
      <div className="demo-body">
        <nav className="demo-side" aria-label={t('demo.nav_label')}>
          {NAV.map((n) => (
            <button key={n.key} type="button" className={`demo-navitem ${n.key === section ? 'is-active' : ''}`} aria-current={n.key === section ? 'page' : undefined} onClick={() => go(n.key)}>
              <Icon name={n.icon} size={Math.round(20 * scale)} /><span>{t(n.k)}</span>
            </button>
          ))}
          <div className="demo-side-foot xs">{t('demo.side_foot', { business: prospect.business_name })}</div>
        </nav>
        <main className="demo-main" id="demo-main">{children(d)}</main>
      </div>
      <nav className="demo-bottomnav" aria-label={t('demo.nav_label')}>
        {NAV.map((n) => (
          <button key={n.key} type="button" className={`demo-tabitem ${n.key === section ? 'is-active' : ''}`} aria-current={n.key === section ? 'page' : undefined} onClick={() => go(n.key)}>
            <Icon name={n.icon} size={Math.round(22 * scale)} /><span className="demo-tablabel">{t(n.k)}</span>
          </button>
        ))}
      </nav>
      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title={t('demo.save_title', { business: prospect.business_name })} size="sm"
        footer={<><Button variant="ghost" onClick={() => setSaveOpen(false)}>{t('demo.cancel')}</Button><Button variant="primary" icon="check" onClick={submitSave}>{t('demo.save_submit')}</Button></>}>
        <div className="stack">
          <p className="small muted">{t('demo.save_body')}</p>
          <Field label={t('demo.name')}><Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder={prospect.first_name} /></Field>
          <Field label={t('demo.email')} hint={t('demo.email_hint')}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" /></Field>
          <p className="xs muted">{t('demo.save_note')}</p>
        </div>
      </Modal>
    </div>
  );
}
