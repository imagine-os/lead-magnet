import { useLocation, useNavigate } from 'react-router-dom';
import type { ProspectRow } from '../../data/schema/core';
import { useI18n } from '../../i18n/I18nProvider';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import type { IconName } from '../../components/atom/Icon/Icon';
import { fullName } from './lib';

const TABS: { suffix: string; key: string; icon: IconName; code: string }[] = [
  { suffix: '', key: 'studio.tab_profile', icon: 'user', code: 'S-02' },
  { suffix: '/compose', key: 'studio.tab_compose', icon: 'wand', code: 'S-03' },
  { suffix: '/assets', key: 'studio.tab_assets', icon: 'image', code: 'S-04' },
  { suffix: '/outreach', key: 'studio.tab_outreach', icon: 'mail', code: 'S-05' },
];

/** Header + tab strip shared by S-02..S-05: who we are working on and where to go next. */
export function ProspectNav({ p }: { p: ProspectRow }) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const base = `/studio/prospects/${p.id}`;
  return (
    <nav className="st-nav" aria-label={t('studio.nav_label')}>
      <div className="st-nav-who">
        <Button size="sm" variant="ghost" icon="arrow-left" onClick={() => nav('/studio')}>{t('studio.all_prospects')}</Button>
        <Avatar name={fullName(p)} color={p.style.palette.primary} />
        <div className="grow">
          <div className="st-nav-name font-display">{p.business_name}</div>
          <div className="xs muted">{fullName(p)} · {p.city} · <span lang={p.lang}>{p.lang.toUpperCase()}</span></div>
        </div>
        <Badge tone={p.warmth === 'hot' ? 'danger' : p.warmth === 'warm' ? 'warn' : 'info'} size="sm">{t(`studio.warmth_${p.warmth}`)}</Badge>
      </div>
      <div className="st-nav-tabs row wrap">
        {TABS.map((tab) => {
          const to = `${base}${tab.suffix}`;
          const active = pathname === to;
          return <Button key={tab.code} size="sm" variant={active ? 'primary' : 'outline'} icon={tab.icon} aria-current={active ? 'page' : undefined} onClick={() => nav(to)}>{t(tab.key)}</Button>;
        })}
      </div>
    </nav>
  );
}
