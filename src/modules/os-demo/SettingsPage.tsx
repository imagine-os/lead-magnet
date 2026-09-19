/** C-07 settings: every business + life role with a permission summary, the brand palette and font, language, invite. */
import { useMemo } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { DemoShell, type Demo } from './DemoShell';
import type { RoleView } from '../../engine/types';
import { SectionHead } from './widgets';
import { personFor, titleCase, viewKey } from './people';

interface RoleRow { id: string; view: RoleView; role: string; kind: 'business' | 'life'; person: string; color: string; perms: string }

function Settings({ d }: { d: Demo }) {
  const { t } = useI18n();
  const rows: RoleRow[] = useMemo(() => d.views.map((v) => {
    const p = personFor(d.prospect, v.role);
    const owner = /owner|partner|director|manager|principal/i.test(v.role);
    const perms = v.kind === 'life'
      ? (/account|book|cpa|tax/i.test(v.role) ? t('demo.perm_books') : t('demo.perm_life'))
      : owner ? t('demo.perm_all') : t('demo.perm_staff');
    return { id: viewKey(v), view: v, role: v.role, kind: v.kind, person: p.name, color: p.color, perms };
  }), [d.views, d.prospect, t]);
  useActions('C-07', {
    'demo.invite': (p) => `invite for ${String(p?.person ?? '')} is not wired yet (T44 Supabase auth)`,
    'demo.openRole': (p) => { d.goRole(String(p?.role ?? '')); return String(p?.role ?? ''); },
  });
  const cols: Column<RoleRow>[] = [
    { key: 'role', header: t('demo.role'), render: (r) => <span className="row"><Avatar name={r.person} color={r.color} size="sm" /><span className="stack-sm"><strong>{titleCase(r.role)}</strong><span className="xs muted">{r.person}</span></span></span> },
    { key: 'kind', header: t('demo.kind'), render: (r) => <Badge size="sm" tone={r.kind === 'business' ? 'primary' : 'accent'}>{r.kind === 'business' ? t('demo.group_biz') : t('demo.group_life')}</Badge> },
    { key: 'perms', header: t('demo.permissions') },
    { key: 'open', header: t('demo.view'), align: 'right', render: (r) => <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => d.goView(r.view)}>{t('demo.open_view')}</Button> },
  ];
  const pal = d.prospect.style.palette;
  const swatches: [string, string][] = [['primary', pal.primary], ['accent', pal.accent], ['bg', pal.bg], ['surface', pal.surface], ['text', pal.text]];
  return (
    <div className="demo-page">
      <SectionHead title={t('demo.settings')} sub={t('demo.settings_sub', { business: d.prospect.business_name })} />
      <section className="demo-block">
        <SectionHead title={t('demo.roles_title')} sub={t('demo.roles_sub', { n: d.views.length })} right={<Placeholder will="invite a teammate or family member by email and set their role" by="T44 Supabase auth" button={{ label: t('demo.invite'), variant: 'primary', size: 'sm', icon: 'plus' }} />} />
        <DataTable columns={cols} rows={rows} caption={t('demo.roles_title')} empty={{ title: t('demo.no_roles') }} />
      </section>
      <div className="demo-settinggrid">
        <Card padding="md" className="stack">
          <SectionHead title={t('demo.brand')} sub={t('demo.brand_sub')} />
          <div className="demo-swatches">
            {swatches.map(([name, hex]) => (
              <div key={name} className="demo-swatch"><span className="demo-chip" style={{ background: hex }} aria-hidden /><span className="xs">{name}</span><code className="xs muted">{hex}</code></div>
            ))}
          </div>
          <div className="demo-fontrow"><span className="eyebrow">{t('demo.font')}</span><span className="demo-fontsample font-lp-display">{d.prospect.business_name}</span><Badge size="sm" tone="neutral">{d.prospect.style.font}</Badge><Badge size="sm" tone="neutral">{d.prospect.style.tone}</Badge></div>
          <Placeholder will="upload a logo and pick fonts from the brand kit" by="T40 image generation" button={{ label: t('demo.edit_brand'), variant: 'outline', size: 'sm', icon: 'edit' }} />
        </Card>
        <Card padding="md" className="stack">
          <SectionHead title={t('demo.language')} sub={t('demo.language_sub')} />
          <LangToggle />
          <p className="xs muted">{t('demo.language_note', { lang: d.prospect.lang.toUpperCase() })}</p>
          <SectionHead title={t('demo.data')} sub={t('demo.data_sub')} />
          <div className="row wrap">
            <Placeholder will="export every table as CSV" by="T44 Supabase" button={{ label: t('demo.export'), variant: 'outline', size: 'sm', icon: 'doc' }} />
            <Button size="sm" variant="ghost" icon="heart" onClick={d.openSave}>{t('demo.save')}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
export const SettingsPage = () => <DemoShell code="C-07" section="settings">{(d) => <Settings d={d} />}</DemoShell>;
