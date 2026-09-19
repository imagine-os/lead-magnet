/** C-01 (default: first business role) / C-02 role home: headline, today strip, quick actions, the role's widgets. */
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { track } from '../../tracking';
import type { Widget } from '../../engine/types';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DemoShell, type Demo } from './DemoShell';
import { WidgetCard, SectionHead } from './widgets';
import { quickActionsFor, todayFor } from './sample';
import { titleCase, viewKey, viewSlug } from './people';

function RoleHome({ d, code }: { d: Demo; code: string }) {
  const { t, bi } = useI18n();
  const nav = useNavigate();
  const v = d.activeView;
  const quick = quickActionsFor(d.activeRole, d.base);
  const today = todayFor(d.prospect, d.ind, d.activeRole || 'owner');
  const openWidget = (w: Widget): { to?: string; will?: string } => {
    if (w.kind === 'chat') return { to: `${d.base}/comms` };
    if (w.kind === 'table') return { to: `${d.base}/money` };
    if (w.kind === 'doc') return { will: 'open the document in the editor with the template library' };
    if (w.kind === 'calendar') return { will: 'open the full calendar with drag-free rescheduling' };
    return { will: `open the full ${bi(w.title)} view` };
  };
  useActions(code, {
    'demo.openWidget': (p) => { const w = v?.widgets.find((x) => x.id === String(p?.widget) || x.title.en === String(p?.widget)); const r = w ? openWidget(w) : {}; if (r.to) nav(r.to.replace(/^#/, '')); return r.to ?? r.will ?? 'no such widget'; },
    'demo.quickAction': (p) => { const q = quick.find((x) => x.id === String(p?.action)); if (q?.to) nav(q.to); return q?.to ?? q?.will ?? 'no such quick action'; },
  });
  if (!v) return <EmptyState icon="users" title={t('demo.no_roles')} body={t('demo.no_roles_body')} />;
  return (
    <div className="demo-page">
      <header className="demo-hero">
        <div className="demo-hero-text">
          <div className="row wrap demo-eyebrow">
            <Badge tone="primary" size="sm">{v.kind === 'life' ? t('demo.group_life') : t('demo.group_biz')}</Badge>
            <span className="eyebrow">{titleCase(v.role)}</span>
          </div>
          <h1 className="demo-h1">{bi(v.headline)}</h1>
          <p className="muted small">{t('demo.hero_sub', { business: d.prospect.business_name, city: d.prospect.city })}</p>
        </div>
        <div className="demo-hero-roles row wrap" role="group" aria-label={t('demo.other_roles')}>
          {d.views.filter((x) => x !== v).slice(0, 6).map((x) => (
            <Chip key={viewKey(x)} onClick={() => { void track('cta_click', { cta: 'role_chip', role: x.role, kind: x.kind }, d.ctx); nav(`${d.base}/role/${viewSlug(x, d.views)}`); }}>{x.kind === 'life' && x.role === v.role ? `${titleCase(x.role)} · ${t('demo.group_life')}` : titleCase(x.role)}</Chip>
          ))}
        </div>
      </header>

      <section aria-label={t('demo.today')} className="demo-today">
        {today.map((x) => <div key={x.id} className="demo-today-item"><span className="eyebrow">{bi(x.label)}</span><span className="demo-today-value font-display">{x.value}</span></div>)}
      </section>

      <section className="demo-block" aria-label={t('demo.quick')}>
        <SectionHead title={t('demo.quick')} sub={t('demo.quick_sub')} />
        <div className="row wrap">
          {quick.map((q) => q.to
            ? <Button key={q.id} variant="outline" icon={q.icon} onClick={() => nav(q.to!)}>{bi(q.label)}</Button>
            : <Placeholder key={q.id} will={q.will ?? 'do this'} by={q.by ?? 'os-demo, a later pass'} button={{ label: bi(q.label), variant: 'outline', icon: q.icon }} />)}
        </div>
      </section>

      <section className="demo-block" aria-label={t('demo.widgets')}>
        <SectionHead title={t('demo.widgets')} sub={t('demo.widgets_sub', { role: titleCase(v.role) })} />
        <div className="demo-widgets">
          {v.widgets.map((w) => <WidgetCard key={w.id} w={w} p={d.prospect} ind={d.ind} open={openWidget} />)}
        </div>
      </section>
    </div>
  );
}

export const DemoHomePage = () => <DemoShell code="C-01" section="home">{(d) => <RoleHome d={d} code="C-01" />}</DemoShell>;
export const RoleHomePage = () => <DemoShell code="C-02" section="home">{(d) => <RoleHome d={d} code="C-02" />}</DemoShell>;
