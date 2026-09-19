import { useRef, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { Icon } from '../../components/atom/Icon/Icon';
import { useGamepadNav, useSpatialNav } from '../../a11y';
import './website.css';

export type SitePage = 'home' | 'how' | 'pricing';
const NAV: { key: SitePage; to: string; label: string }[] = [
  { key: 'home', to: '/site', label: 'site.nav_home' },
  { key: 'how', to: '/site/how', label: 'site.nav_how' },
  { key: 'pricing', to: '/site/pricing', label: 'site.nav_pricing' },
];

/** Imagine's own chrome for W-01..W-03: our brand, our tokens, no prospect theming. Public pages own their chrome. */
export function SiteChrome({ active, children }: { active: SitePage; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null); const spatial = useSpatialNav(root); useGamepadNav(spatial); // P-04: arrows / d-pad move focus (pass-3 integration)
  const { t } = useI18n();
  return (<div className="site" ref={root}>
    <a className="site-skip" href="#site-main">{t('site.skip')}</a>
    <header className="site-head">
      <div className="container container-wide site-head-in">
        <Link to="/site" className="site-brand" aria-label={t('site.brand_aria')}><span className="site-mark" aria-hidden>IM</span><span className="site-wordmark font-display">Imagine</span></Link>
        <nav className="site-nav" aria-label={t('site.nav_aria')}>
          {NAV.map((n) => <NavLink key={n.key} to={n.to} end className={({ isActive }) => `site-navlink ${isActive || active === n.key ? 'is-active' : ''}`}>{t(n.label)}</NavLink>)}
          <Link to="/" className="site-navlink site-navlink-hub"><Icon name="grid" size={16} />{t('site.nav_hub')}</Link>
        </nav>
        <div className="site-lang"><LangToggle /></div>
      </div>
    </header>
    <main id="site-main" className="site-main">{children}</main>
    <footer className="site-foot">
      <div className="container container-wide site-foot-in">
        <div className="stack-sm"><span className="site-wordmark font-display">Imagine</span><span className="xs muted">{t('site.foot_tag')}</span></div>
        <nav className="site-foot-nav" aria-label={t('site.foot_aria')}>
          {NAV.map((n) => <Link key={n.key} to={n.to} className="site-foot-link">{t(n.label)}</Link>)}
          <Link to="/" className="site-foot-link">{t('site.nav_hub')}</Link>
        </nav>
        <p className="xs muted site-foot-note">{t('site.foot_note')}</p>
      </div>
    </footer>
  </div>);
}
