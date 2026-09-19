import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { ModelName, TaskRow } from '../../data/schema/core';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Chip } from '../../components/atom/Chip/Chip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Select } from '../../components/atom/Select/Select';
import { Tooltip } from '../../components/molecule/Tooltip/Tooltip';
import { CodeChips, ModelBadge, TaskLink } from './bits';
import { useLatest } from '../../actions';
import { GRAPH, LANES, MODEL_LIST, buildGraph, criticalPath, dependentsOf, downstreamOf, edgePath, indexTasks, readiness, upstreamOf } from './taskModel';
import './plan.css';

const MIN = 0.4, MAX = 2, clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** K-03: the plan as a dependency graph. Phases are columns, depends_on are arrows, there is no date axis. */
export function TimelinePage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { rows: tasks } = useTable<TaskRow>('tasks', { orderBy: { column: 'id' } });
  const [phase, setPhase] = useState<number | 'all'>('all');
  const [model, setModel] = useState<ModelName | 'all'>('all');
  const [zoom, setZoom] = useState(1);
  const [params] = useSearchParams();
  const [focusId, setFocusId] = useState<string | null>(params.get('focus'));
  const scroller = useRef<HTMLDivElement>(null);

  const allMap = useMemo(() => indexTasks(tasks), [tasks]);
  const phases = useMemo(() => [...new Set(tasks.map((x) => x.phase))].sort((a, b) => a - b), [tasks]);
  const shown = useMemo(() => tasks.filter((x) => (phase === 'all' || x.phase === phase) && (model === 'all' || x.model === model)), [tasks, phase, model]);
  const graph = useMemo(() => buildGraph(shown), [shown]);
  const shownMap = useMemo(() => indexTasks(shown), [shown]);
  const critical = useMemo(() => criticalPath(tasks), [tasks]);

  const focus = focusId ? allMap[focusId] : null;
  const up = useMemo(() => (focusId ? upstreamOf(focusId, allMap) : new Set<string>()), [focusId, allMap]);
  const down = useMemo(() => (focusId ? downstreamOf(focusId, tasks) : new Set<string>()), [focusId, tasks]);
  const lit = useMemo(() => (focusId ? new Set([focusId, ...up, ...down]) : null), [focusId, up, down]);

  const zoomTo = useCallback((z: number) => setZoom(Math.min(MAX, Math.max(MIN, Number(z.toFixed(2))))), []);
  /** Fit-to-width: the whole graph visible in the frame on first render and whenever the frame or the graph changes (review fix, changelog 0009). */
  const fit = useCallback(() => { const el = scroller.current; if (!el || !graph.width) return; const inner = el.clientWidth - 16; if (inner > 0) zoomTo(inner / graph.width); }, [graph.width, zoomTo]);
  const userZoomed = useRef(false);
  useEffect(() => { if (userZoomed.current) return; fit(); const el = scroller.current; if (!el || typeof ResizeObserver === 'undefined') return; const ro = new ResizeObserver(() => { if (!userZoomed.current) fit(); }); ro.observe(el); return () => ro.disconnect(); }, [fit]);
  const zoomBy = (z: number) => { userZoomed.current = true; zoomTo(z); };
  const focusTask = useCallback((id: string) => {
    setFocusId(id || null);
    if (!id) return { ok: true, focus: null };
    window.requestAnimationFrame(() => { const el = scroller.current?.querySelector<SVGGElement>(`[data-node="${id}"]`); el?.focus?.(); el?.scrollIntoView?.({ block: 'nearest', inline: 'center' }); });
    return { ok: true, focus: id, upstream: [...upstreamOf(id, allMap)], downstream: [...downstreamOf(id, tasks)] };
  }, [allMap, tasks]);

  const live = useLatest({ focusTask, zoom, graph, focusId });
  useActions('K-03', {
    'plan.focusTask': (p) => live.current.focusTask(String(p?.task ?? '')),
    'plan.zoomGraph': (p) => { const pct = Number(p?.percent); const z = live.current.zoom; zoomBy(Number.isFinite(pct) ? pct / 100 : z * 1.25); return { zoom: Math.round(z * 100) }; },
    'plan.filter': (p) => { if (p?.phase != null) setPhase(p.phase === 'all' ? 'all' : Number(p.phase)); if (p?.model != null) setModel(p.model === 'all' ? 'all' : (String(p.model) as ModelName)); return { nodes: live.current.graph.nodes.length }; },
    'plan.openTask': (p) => { nav(`/plan/tasks/${String(p?.task ?? live.current.focusId ?? '')}`); return { ok: true }; },
  });

  const onKey = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(zoom * 1.25); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(zoom / 1.25); }
    else if (e.key === '0') { e.preventDefault(); userZoomed.current = false; fit(); }
    else if (e.key === 'Escape' && focusId) { e.preventDefault(); setFocusId(null); }
  };

  return (<div className="container container-wide page stack pl-timeline">
    <div className="page-head">
      <div className="stack-sm"><h1>K-03 · {t('plan.k03_title')}</h1><p className="muted small">{t('plan.tagline')}</p></div>
      <nav className="row wrap xs" aria-label={t('plan.views')}><Link to="/plan">{t('plan.view_kanban')}</Link><span className="faint">·</span><Link to="/plan/list">{t('plan.view_list')}</Link></nav>
    </div>

    <div className="grid grid-4 pl-stats">
      <Stat label={t('plan.tasks')} value={tasks.length} />
      <Stat label={t('plan.critical_path')} value={critical.length} tone="accent" hint={t('plan.critical_path_hint', { path: critical.path.join(' → ') })} />
      <Stat label={t('plan.edges')} value={graph.edges.length} hint={t('plan.edges_hint')} />
      <Stat label={t('plan.ready')} value={tasks.filter((x) => x.status !== 'done' && readiness(x, allMap).ready).length} tone="success" hint={t('plan.ready_hint')} />
    </div>

    <div className="row wrap pl-filters" role="group" aria-label={t('plan.filters')}>
      <span className="eyebrow">{t('plan.phase')}</span>
      <Chip selected={phase === 'all'} onClick={() => setPhase('all')}>{t('plan.all')}</Chip>
      {phases.map((p) => <Chip key={p} selected={phase === p} onClick={() => setPhase(p)}>{p}</Chip>)}
      <span className="faint">|</span>
      <span className="eyebrow">{t('plan.model')}</span>
      <Chip selected={model === 'all'} onClick={() => setModel('all')}>{t('plan.all')}</Chip>
      {MODEL_LIST.map((m) => <Chip key={m} selected={model === m} onClick={() => setModel(m)}>{m}</Chip>)}
    </div>

    <div className="row wrap pl-graph-bar">
      <Select className="pl-focus-select" aria-label={t('plan.focus_pick')} value={focusId ?? ''} options={[{ value: '', label: t('plan.focus_none') }, ...shown.map((x) => ({ value: x.id, label: `${x.id} · ${x.title}` }))]} onChange={(e) => focusTask(e.target.value)} />
      <Button size="sm" variant="outline" icon="target" onClick={() => focusTask(critical.path[critical.path.length - 1] ?? '')}>{t('plan.focus_critical')}</Button>
      {focusId && <Button size="sm" variant="ghost" icon="close" onClick={() => setFocusId(null)}>{t('plan.clear_focus')}</Button>}
      <span className="grow" />
      <Tooltip text={t('plan.zoom_out')}><IconButton icon="zoom-out" label={t('plan.zoom_out')} variant="outline" size="sm" onClick={() => zoomBy(zoom / 1.25)} /></Tooltip>
      <span className="pl-zoom mono xs" aria-live="polite">{Math.round(zoom * 100)}%</span>
      <Tooltip text={t('plan.zoom_in')}><IconButton icon="zoom-in" label={t('plan.zoom_in')} variant="outline" size="sm" onClick={() => zoomBy(zoom * 1.25)} /></Tooltip>
      <Tooltip text={t('plan.zoom_reset')}><IconButton icon="maximize" label={t('plan.zoom_reset')} variant="outline" size="sm" onClick={() => { userZoomed.current = false; fit(); }} /></Tooltip>
    </div>

    <div className="pl-graph-wrap">
      <div ref={scroller} className="pl-graph-scroll" tabIndex={0} role="group" aria-label={t('plan.graph_label')} onKeyDown={onKey}>
        <svg className="pl-graph" width={graph.width * zoom} height={graph.height * zoom} viewBox={`0 0 ${graph.width} ${graph.height}`} role="img" aria-label={t('plan.graph_aria', { nodes: graph.nodes.length, edges: graph.edges.length })}>
          <defs>
            <marker id="pl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className="pl-arrowhead" /></marker>
          </defs>
          {graph.bands.map((b) => (<g key={b.phase} className="pl-band">
            <rect x={b.x} y={64} width={b.width} height={graph.height - 80} rx={14} className="pl-band-rect" />
            <text x={b.x + 14} y={44} className="pl-band-label">{t('plan.phase_n', { n: b.phase })}</text>
            <text x={b.x + 14} y={60} className="pl-band-sub">{t('plan.phase_tasks', { n: shown.filter((x) => x.phase === b.phase).length })}</text>
          </g>))}
          <g className="pl-edges">
            {graph.edges.map((e) => { const on = !lit || (lit.has(e.from.task.id) && lit.has(e.to.task.id)); return <path key={e.id} d={edgePath(e)} className={`pl-edge ${on ? '' : 'is-dim'} ${e.from.task.status === 'done' ? 'is-satisfied' : ''}`} markerEnd="url(#pl-arrow)" />; })}
          </g>
          <g className="pl-nodes">
            {graph.nodes.map((n) => {
              const task = n.task;
              const r = readiness(task, allMap);
              const on = !lit || lit.has(task.id);
              const rel = focusId === task.id ? 'focus' : up.has(task.id) ? 'up' : down.has(task.id) ? 'down' : '';
              return (<g key={task.id} data-node={task.id} className={`pl-node is-${task.status} ${on ? '' : 'is-dim'} ${rel ? `is-${rel}` : ''}`} transform={`translate(${n.x} ${n.y})`}
                role="button" tabIndex={0} aria-pressed={focusId === task.id} aria-label={t('plan.node_aria', { id: task.id, title: task.title, status: t(`plan.lane_${task.status}`), model: task.model, phase: task.phase, deps: r.total, ready: t(r.ready ? 'plan.ready_yes' : 'plan.ready_no') })}
                onClick={() => focusTask(task.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusTask(task.id); } }}>
                <title>{`${task.id} · ${task.title}`}</title>
                <rect width={GRAPH.nodeW} height={GRAPH.nodeH} rx={12} className="pl-node-box" />
                <rect width={5} height={GRAPH.nodeH} rx={2.5} className="pl-node-spine" />
                <text x={14} y={21} className="pl-node-id">{task.id}</text>
                <text x={52} y={21} className={`pl-node-model pl-model-${task.model.split(' ')[0].toLowerCase()}`}>{task.model}</text>
                {task.status !== 'done' && r.ready && <circle cx={GRAPH.nodeW - 14} cy={17} r={5} className="pl-node-ready" />}
                <text x={14} y={41} className="pl-node-title">{clip(task.title, 26)}</text>
                <text x={14} y={54} className="pl-node-meta">{task.module}{r.total ? ` · ${t('plan.deps', { done: r.done, total: r.total })}` : ` · ${t('plan.deps_none')}`}</text>
              </g>);
            })}
          </g>
        </svg>
      </div>
      <p className="xs muted pl-graph-hint">{t('plan.graph_hint')}</p>
    </div>

    {focus && (<Card className="pl-focus-card" padding="md">
      <div className="row wrap"><TaskLink id={focus.id} /><h2 className="pl-focus-title">{focus.title}</h2><span className="grow" /><Badge status={focus.status} size="sm">{t(`plan.lane_${focus.status}`)}</Badge><ModelBadge model={focus.model} /></div>
      <div className="row wrap xs"><span className="muted">{t('plan.phase_n', { n: focus.phase })}</span><span className="faint">·</span><span className="muted">{focus.module}</span><CodeChips codes={focus.codes} /></div>
      {focus.notes && <p className="small muted">{focus.notes}</p>}
      <div className="grid grid-2 pl-focus-grid">
        <div className="stack-sm"><span className="eyebrow">{t('plan.waits_on')} ({up.size})</span>
          {up.size === 0 ? <span className="xs muted">{t('plan.deps_none')}</span> : <div className="row wrap xs">{[...up].sort().map((id) => <Link key={id} to={`/plan/tasks/${id}`} className={`pl-dep ${allMap[id]?.status === 'done' ? 'is-done' : 'is-open'}`} title={allMap[id]?.title}><code>{id}</code></Link>)}</div>}
        </div>
        <div className="stack-sm"><span className="eyebrow">{t('plan.blocks')} ({down.size})</span>
          {down.size === 0 ? <span className="xs muted">{t('plan.blocks_none')}</span> : <div className="row wrap xs">{[...down].sort().map((id) => <Link key={id} to={`/plan/tasks/${id}`} className="pl-dep is-open" title={allMap[id]?.title}><code>{id}</code></Link>)}</div>}
        </div>
      </div>
      <div className="row wrap"><Link to={`/plan/tasks/${focus.id}`}><Button size="sm" variant="primary" iconRight="arrow-right">{t('plan.open_task')}</Button></Link><Button size="sm" variant="ghost" onClick={() => setFocusId(null)}>{t('plan.clear_focus')}</Button>
        <span className="xs faint">{t('plan.direct_deps', { n: (focus.depends_on ?? []).length, d: dependentsOf(focus.id, tasks).length })}</span></div>
    </Card>)}

    <Card padding="sm" className="pl-legend">
      <div className="row wrap"><span className="eyebrow">{t('plan.legend')}</span>
        {LANES.map((l) => <span key={l} className="pl-legend-item xs"><span className={`pl-swatch is-${l}`} aria-hidden />{t(`plan.lane_${l}`)}</span>)}
        <span className="faint">|</span>
        {MODEL_LIST.map((m) => <ModelBadge key={m} model={m} />)}
        <span className="faint">|</span>
        <span className="pl-legend-item xs"><span className="pl-swatch is-ready" aria-hidden />{t('plan.ready_yes')}</span>
        <span className="pl-legend-item xs">{t('plan.legend_edge')}</span>
      </div>
      {!shownMap[focusId ?? ''] && focusId && <p className="xs muted">{t('plan.focus_filtered')}</p>}
    </Card>
  </div>);
}
