import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { useData, useTable } from '../../data/DataContext';
import type { ModelName, TaskRow, TaskStatus } from '../../data/schema/core';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Chip } from '../../components/atom/Chip/Chip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Select } from '../../components/atom/Select/Select';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { ProgressBar } from '../../components/atom/ProgressBar/ProgressBar';
import { Tooltip } from '../../components/molecule/Tooltip/Tooltip';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { useToast } from '../../components/molecule/Toast/Toast';
import { CodeChips, ModelBadge, TaskLink } from './bits';
import { useLatest } from '../../actions';
import { LANES, MODEL_LIST, indexTasks, readiness, statusChange, statusPatch } from './taskModel';
import './plan.css';

/** K-01: the plan as five lanes. Moving a card writes tasks.status by id through the provider (never drag-only: Select + prev / next buttons). */
export function KanbanPage() {
  const { t } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const { rows: tasks } = useTable<TaskRow>('tasks', { orderBy: { column: 'id' } });
  const [phase, setPhase] = useState<number | 'all'>('all');
  const [model, setModel] = useState<ModelName | 'all'>('all');
  const [readyOnly, setReadyOnly] = useState(false);
  const editable = can('plan.edit');

  const map = useMemo(() => indexTasks(tasks), [tasks]);
  const phases = useMemo(() => [...new Set(tasks.map((x) => x.phase))].sort((a, b) => a - b), [tasks]);
  const shown = tasks.filter((x) => (phase === 'all' || x.phase === phase) && (model === 'all' || x.model === model) && (!readyOnly || readiness(x, map).ready));
  const done = tasks.filter((x) => x.status === 'done').length;
  const ready = tasks.filter((x) => x.status !== 'done' && readiness(x, map).ready).length;
  const waiting = tasks.filter((x) => x.status === 'blocked' || x.status === 'awaiting_justin').length;

  const move = (id: string, next: TaskStatus) => {
    const task = map[id];
    if (!task) return { ok: false, error: `unknown task ${id}` };
    if (!editable) { toast.push({ tone: 'warn', title: t('plan.readonly'), body: t('plan.readonly_body') }); return { ok: false, error: 'plan.edit required' }; }
    const check = statusChange(task, next, map);
    if (!check.ok) { toast.push({ tone: 'danger', title: t('plan.rule_blocked'), body: t('plan.rule_blocked_body', { rule: check.rule ?? 'R-K01', deps: check.missing.join(', ') }) }); return { ok: false, error: `${check.rule}: ${check.missing.join(', ')}` }; }
    void data.update<TaskRow>('tasks', id, statusPatch(next));
    toast.push({ tone: 'success', title: t('plan.moved', { id, status: t(`plan.lane_${next}`) }) });
    return { ok: true, id, status: next };
  };
  const step = (task: TaskRow, dir: 1 | -1) => { const i = LANES.indexOf(task.status); const next = LANES[i + dir]; if (next) move(task.id, next); };

  const live = useLatest({ move, phase, model });
  useActions('K-01', {
    'plan.moveTask': (p) => live.current.move(String(p?.task ?? ''), String(p?.status ?? 'backlog') as TaskStatus),
    'plan.filter': (p) => { if (p?.phase != null) setPhase(p.phase === 'all' ? 'all' : Number(p.phase)); if (p?.model != null) setModel(p.model === 'all' ? 'all' : (String(p.model) as ModelName)); if (p?.ready != null) setReadyOnly(Boolean(p.ready)); return { phase: live.current.phase, model: live.current.model }; },
    'plan.openTask': (p) => { nav(`/plan/tasks/${String(p?.task ?? '')}`); return { ok: true }; },
    'plan.syncBuildPlan': () => { toast.push({ tone: 'info', title: t('plan.sync_docs'), body: t('plan.sync_docs_will') }); return { ok: false, error: 'not wired yet (T20)' }; },
  });

  return (<div className="container container-wide page stack">
    <div className="page-head">
      <div className="stack-sm"><h1>K-01 · {t('plan.k01_title')}</h1><p className="muted small">{t('plan.tagline')}</p></div>
      <nav className="pl-views row wrap xs" aria-label={t('plan.views')}><Link to="/plan/list">{t('plan.view_list')}</Link><span className="faint">·</span><Link to="/plan/timeline">{t('plan.view_timeline')}</Link></nav>
    </div>

    <div className="grid grid-4 pl-stats">
      <Stat label={t('plan.tasks')} value={tasks.length} />
      <Stat label={t('plan.done')} value={done} tone="success" />
      <Stat label={t('plan.ready')} value={ready} tone="accent" hint={t('plan.ready_hint')} />
      <Stat label={t('plan.waiting')} value={waiting} tone="warn" hint={t('plan.waiting_hint')} />
    </div>
    <ProgressBar value={done} max={Math.max(1, tasks.length)} label={t('plan.progress')} tone="success" />

    <div className="row wrap pl-filters" role="group" aria-label={t('plan.filters')}>
      <span className="eyebrow">{t('plan.phase')}</span>
      <Chip selected={phase === 'all'} onClick={() => setPhase('all')}>{t('plan.all')}</Chip>
      {phases.map((p) => <Chip key={p} selected={phase === p} onClick={() => setPhase(p)}>{p}</Chip>)}
      <span className="faint">|</span>
      <span className="eyebrow">{t('plan.model')}</span>
      <Chip selected={model === 'all'} onClick={() => setModel('all')}>{t('plan.all')}</Chip>
      {MODEL_LIST.map((m) => <Chip key={m} selected={model === m} onClick={() => setModel(m)}>{m}</Chip>)}
      <span className="faint">|</span>
      <Chip selected={readyOnly} onClick={() => setReadyOnly(!readyOnly)}>{t('plan.ready_only')}</Chip>
      <span className="grow" />
      <Placeholder will={t('plan.sync_docs_will')} by="T20" button={{ label: t('plan.sync_docs'), variant: 'ghost', size: 'sm', icon: 'doc' }} />
    </div>
    {!editable && <p className="xs muted" role="status">{t('plan.readonly_body')}</p>}

    <div className="pl-lanes">
      {LANES.map((lane) => {
        const cards = shown.filter((x) => x.status === lane);
        return (<section key={lane} className={`pl-lane pl-lane-${lane}`} aria-label={`${t(`plan.lane_${lane}`)} (${cards.length})`}>
          <header className="pl-lane-head"><h2 className="pl-lane-title">{t(`plan.lane_${lane}`)}</h2><Badge status={lane} size="sm">{cards.length}</Badge></header>
          <div className="pl-lane-body">
            {cards.length === 0 && <div className="pl-lane-empty"><EmptyState icon="kanban" title={t('plan.empty_lane')} /></div>}
            {cards.map((task) => {
              const r = readiness(task, map);
              const i = LANES.indexOf(task.status);
              return (<Card key={task.id} padding="sm" className="pl-card">
                <div className="row wrap pl-card-top">
                  <TaskLink id={task.id} title={task.title} />
                  <ModelBadge model={task.model} />
                  <span className="grow" />
                  <span className="xs faint" title={t('plan.phase')}>P{task.phase}</span>
                </div>
                <Link to={`/plan/tasks/${task.id}`} className="pl-card-title">{task.title}</Link>
                <div className="row wrap xs"><span className="muted">{task.module}</span><CodeChips codes={task.codes} /></div>
                <div className="row wrap xs pl-deps">
                  {r.total === 0
                    ? <span className="muted">{t('plan.deps_none')}</span>
                    : <Tooltip text={r.ready ? t('plan.deps_all_done', { list: task.depends_on.join(', ') }) : t('plan.deps_waiting', { list: r.missing.join(', ') })}>
                        <span className="pl-depcount" tabIndex={0}>{t('plan.deps', { done: r.done, total: r.total })}</span>
                      </Tooltip>}
                  {task.status !== 'done' && <Badge tone={r.ready ? 'success' : 'neutral'} size="sm">{r.ready ? t('plan.ready_yes') : t('plan.ready_no')}</Badge>}
                </div>
                {editable && <div className="row wrap pl-move">
                  <IconButton icon="arrow-left" label={t('plan.move_prev')} variant="outline" size="sm" disabled={i <= 0} onClick={() => step(task, -1)} />
                  <Select className="pl-move-select" aria-label={t('plan.set_status_for', { id: task.id })} value={task.status} options={LANES.map((l) => ({ value: l, label: t(`plan.lane_${l}`) }))} onChange={(e) => move(task.id, e.target.value as TaskStatus)} />
                  <IconButton icon="arrow-right" label={t('plan.move_next')} variant="outline" size="sm" disabled={i >= LANES.length - 1} onClick={() => step(task, 1)} />
                </div>}
              </Card>);
            })}
          </div>
        </section>);
      })}
    </div>
  </div>);
}
