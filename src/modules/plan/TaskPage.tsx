import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { useData, useTable } from '../../data/DataContext';
import type { TaskRow, TaskStatus } from '../../data/schema/core';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { Field } from '../../components/molecule/Field/Field';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { CodeChips, ModelBadge } from './bits';
import { useLatest } from '../../actions';
import { LANES, dependentsOf, indexTasks, readiness, statusChange, statusPatch } from './taskModel';
import './plan.css';

/** K-04: one task, both directions of its dependency graph, and the status Select that writes the change. */
export function TaskPage() {
  const { id = '' } = useParams();
  const { t } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const { rows: tasks } = useTable<TaskRow>('tasks', { orderBy: { column: 'id' } });
  const map = useMemo(() => indexTasks(tasks), [tasks]);
  const task = map[id] ?? null;
  const editable = can('plan.edit');

  const setStatus = (next: TaskStatus) => {
    if (!task) return { ok: false, error: `unknown task ${id}` };
    if (!editable) { toast.push({ tone: 'warn', title: t('plan.readonly'), body: t('plan.readonly_body') }); return { ok: false, error: 'plan.edit required' }; }
    const check = statusChange(task, next, map);
    if (!check.ok) { toast.push({ tone: 'danger', title: t('plan.rule_blocked'), body: t('plan.rule_blocked_body', { rule: check.rule ?? 'R-K01', deps: check.missing.join(', ') }) }); return { ok: false, error: `${check.rule}: ${check.missing.join(', ')}` }; }
    void data.update<TaskRow>('tasks', task.id, statusPatch(next));
    toast.push({ tone: 'success', title: t('plan.moved', { id: task.id, status: t(`plan.lane_${next}`) }) });
    return { ok: true, id: task.id, status: next };
  };
  const live = useLatest({ setStatus, task });
  useActions('K-04', {
    'plan.setStatus': (p) => live.current.setStatus(String(p?.status ?? live.current.task?.status ?? 'backlog') as TaskStatus),
    'plan.openTask': (p) => { nav(`/plan/tasks/${String(p?.task ?? id)}`); return { ok: true }; },
  });

  if (!task) return (<div className="container page"><EmptyState icon="kanban" title={t('plan.not_found', { id })} body={t('plan.not_found_body')} action={<Link to="/plan"><Button variant="primary" icon="kanban">{t('plan.back_to_kanban')}</Button></Link>} /></div>);

  const r = readiness(task, map);
  const deps = task.depends_on ?? [];
  const dependents = dependentsOf(task.id, tasks);

  return (<div className="container page stack pl-task">
    <div className="page-head">
      <div className="stack-sm">
        <div className="row wrap xs"><Link to="/plan">{t('plan.view_kanban')}</Link><span className="faint">/</span><code>{task.id}</code></div>
        <h1>{task.title}</h1>
      </div>
      <nav className="row wrap xs" aria-label={t('plan.views')}><Link to="/plan/list">{t('plan.view_list')}</Link><span className="faint">·</span><Link to="/plan/timeline">{t('plan.view_timeline')}</Link></nav>
    </div>

    <div className="row wrap pl-task-badges">
      <Badge status={task.status} size="md">{t(`plan.lane_${task.status}`)}</Badge>
      <ModelBadge model={task.model} size="md" />
      <Badge size="md">{t('plan.phase_n', { n: task.phase })}</Badge>
      {task.status !== 'done' && <Badge tone={r.ready ? 'success' : 'neutral'} size="md">{r.ready ? t('plan.ready_yes') : t('plan.ready_no')}</Badge>}
      <CodeChips codes={task.codes} />
    </div>

    <div className="grid grid-2 pl-task-grid">
      <Card className="stack-sm">
        <span className="eyebrow">{t('plan.status')}</span>
        {editable
          ? <Field label={t('plan.set_status')} hint={r.ready ? t('plan.rule_ok') : t('plan.rule_hint', { deps: r.missing.join(', ') })}>
              <Select value={task.status} options={LANES.map((l) => ({ value: l, label: t(`plan.lane_${l}`) }))} onChange={(e) => setStatus(e.target.value as TaskStatus)} />
            </Field>
          : <p className="small muted">{t('plan.readonly_body')}</p>}
        <dl className="pl-facts">
          <dt>{t('plan.col_module')}</dt><dd>{task.module}</dd>
          <dt>{t('plan.col_owner')}</dt><dd>{task.owner}</dd>
          <dt>{t('plan.col_model')}</dt><dd>{task.model}</dd>
          <dt>{t('plan.col_phase')}</dt><dd>{task.phase}</dd>
          <dt>{t('plan.col_codes')}</dt><dd>{task.codes.length ? task.codes.join(', ') : '—'}</dd>
          <dt>{t('plan.done_at')}</dt><dd>{task.done_at ? new Date(task.done_at).toLocaleString() : '—'}</dd>
          <dt>{t('plan.updated_at')}</dt><dd>{new Date(task.updated_at).toLocaleString()}</dd>
        </dl>
      </Card>

      <Card className="stack-sm">
        <span className="eyebrow">{t('plan.notes')}</span>
        <p className="small">{task.notes || <span className="muted">{t('plan.no_notes')}</span>}</p>
        <span className="eyebrow">{t('plan.rules')}</span>
        <div className="row wrap xs">{['R-K01', 'R-K02', 'R-K03', 'R-K04'].map((x) => <Link key={x} to={`/dev/rules#${x}`}><code>{x}</code></Link>)}</div>
      </Card>
    </div>

    <div className="grid grid-2 pl-task-grid">
      <Card className="stack-sm">
        <div className="row"><span className="eyebrow">{t('plan.waits_on')}</span><Badge size="sm">{deps.length}</Badge></div>
        {deps.length === 0
          ? <p className="xs muted">{t('plan.deps_none')}</p>
          : <ul className="pl-deplist">{deps.map((d) => { const dep = map[d]; return (<li key={d}>
              <Link to={`/plan/tasks/${d}`}><code>{d}</code></Link>
              <span className="grow">{dep?.title ?? t('plan.unknown_dep')}</span>
              {dep && <Badge status={dep.status} size="sm">{t(`plan.lane_${dep.status}`)}</Badge>}
              {dep && <ModelBadge model={dep.model} />}
            </li>); })}</ul>}
      </Card>
      <Card className="stack-sm">
        <div className="row"><span className="eyebrow">{t('plan.blocks')}</span><Badge size="sm">{dependents.length}</Badge></div>
        {dependents.length === 0
          ? <p className="xs muted">{t('plan.blocks_none')}</p>
          : <ul className="pl-deplist">{dependents.map((d) => (<li key={d.id}>
              <Link to={`/plan/tasks/${d.id}`}><code>{d.id}</code></Link>
              <span className="grow">{d.title}</span>
              <Badge status={d.status} size="sm">{t(`plan.lane_${d.status}`)}</Badge>
              <ModelBadge model={d.model} />
            </li>))}</ul>}
      </Card>
    </div>

    <div className="row wrap"><Link to={`/plan/timeline?focus=${task.id}`}><Button variant="outline" size="sm" icon="chart">{t('plan.see_in_graph')}</Button></Link><Link to="/plan"><Button variant="ghost" size="sm" icon="kanban">{t('plan.back_to_kanban')}</Button></Link></div>
  </div>);
}
