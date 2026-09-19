/** C-03 departments board: one column per department from the industry catalog, with people, open items and a KPI. */
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { DemoShell, type Demo } from './DemoShell';
import { SectionHead } from './widgets';
import { peopleFor, roleSlug, titleCase } from './people';
import { bi } from './sample';

function Departments({ d }: { d: Demo }) {
  const { t, bi: tr } = useI18n();
  const roles = d.biz.map((v) => v.role);
  useActions('C-03', { 'demo.openDepartment': (p) => `department ${String(p?.department ?? '')} is not wired yet (os-demo, a later pass)` });
  return (
    <div className="demo-page">
      <SectionHead title={t('demo.depts')} sub={t('demo.depts_sub', { business: d.prospect.business_name })} />
      <div className="demo-board">
        {d.ind.departments.map((dept, i) => {
          const kpi = d.ind.kpis[i % d.ind.kpis.length];
          const people = peopleFor(d.prospect, dept.en, roles, 2 + (i % 2));
          const items = [...d.ind.pains, bi('Weekly review not sent', 'Revisión semanal sin enviar'), bi('Two approvals waiting', 'Dos aprobaciones pendientes')].slice(i % 2, (i % 2) + 3);
          return (
            <Card key={dept.en} className="demo-col" padding="md">
              <header className="demo-col-head">
                <h3 className="demo-col-title">{tr(dept)}</h3>
                <Badge size="sm" tone="neutral">{items.length} {t('demo.open_items')}</Badge>
              </header>
              <Stat label={tr(kpi.label)} value={kpi.sample} size="md" />
              <div className="demo-people" role="list" aria-label={t('demo.people')}>
                {people.map((p) => (
                  <span key={p.id} role="listitem" className="demo-person">
                    <Avatar name={p.name} color={p.color} size="sm" />
                    <span className="demo-person-text"><span className="demo-person-name">{p.name}</span><span className="xs muted">{titleCase(p.role)}</span></span>
                  </span>
                ))}
              </div>
              <ul className="demo-items">
                {items.map((it, k) => (
                  <li key={it.en}><span className="grow">{tr(it)}</span><Badge size="sm" tone={k === 0 ? 'warn' : 'neutral'}>{k === 0 ? t('demo.now') : t('demo.queued')}</Badge></li>
                ))}
              </ul>
              <div className="row wrap">
                <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => d.goRole(roles[i % Math.max(1, roles.length)] ?? d.activeRole)}>{t('demo.view_role', { role: titleCase(roles[i % Math.max(1, roles.length)] ?? d.activeRole) })}</Button>
                <Placeholder will={`open the ${dept.en} workspace with its queue and files`} by="os-demo, a later pass" button={{ label: t('demo.open_dept'), variant: 'ghost', size: 'sm' }} />
              </div>
            </Card>
          );
        })}
      </div>
      <p className="xs muted demo-note">{t('demo.depts_note')} · <code>{roleSlug(d.activeRole)}</code></p>
    </div>
  );
}
export const DepartmentsPage = () => <DemoShell code="C-03" section="departments">{(d) => <Departments d={d} />}</DemoShell>;
