import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { ModelName, TaskRow, TaskStatus } from '../../data/schema/core';
import { useActions } from '../../actions';
import { DataTable, type Column, type SortState } from '../../components/organism/DataTable/DataTable';
import { Chip } from '../../components/atom/Chip/Chip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Stat } from '../../components/molecule/Stat/Stat';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { CodeChips, ModelBadge } from './bits';
import { useLatest } from '../../actions';
import { LANES, MODEL_LIST, indexTasks, readiness } from './taskModel';
import './plan.css';

type Col = 'id' | 'title' | 'module' | 'codes' | 'model' | 'phase' | 'depends_on' | 'status' | 'owner';
const COLS: Col[] = ['id', 'title', 'module', 'codes', 'model', 'phase', 'depends_on', 'status', 'owner'];
const LABEL_KEY: Record<Col, string> = { id: 'plan.col_id', title: 'plan.col_title', module: 'plan.col_module', codes: 'plan.col_codes', model: 'plan.col_model', phase: 'plan.col_phase', depends_on: 'plan.col_depends', status: 'plan.col_status', owner: 'plan.col_owner' };
interface Row { id: string; title: string; module: string; codes: string; model: ModelName; phase: number; depends_on: number; status: TaskStatus; owner: string; ready: boolean; deps: string[]; codeList: string[] }

/** K-02: every task in one sortable, filterable table; a row opens K-04. */
export function ListPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { rows: tasks } = useTable<TaskRow>('tasks', { orderBy: { column: 'id' } });
  const [status, setStatus] = useState<TaskStatus | 'all'>('all');
  const [model, setModel] = useState<ModelName | 'all'>('all');
  const [phase, setPhase] = useState<number | 'all'>('all');
  const [sortCol, setSortCol] = useState<Col>('id');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');

  const map = useMemo(() => indexTasks(tasks), [tasks]);
  const phases = useMemo(() => [...new Set(tasks.map((x) => x.phase))].sort((a, b) => a - b), [tasks]);
  const rows: Row[] = useMemo(() => {
    const out = tasks
      .filter((x) => (status === 'all' || x.status === status) && (model === 'all' || x.model === model) && (phase === 'all' || x.phase === phase))
      .map((x) => { const r = readiness(x, map); return { id: x.id, title: x.title, module: x.module, codes: x.codes.join(' '), model: x.model, phase: x.phase, depends_on: r.total, status: x.status, owner: x.owner, ready: r.ready, deps: x.depends_on ?? [], codeList: x.codes }; });
    const sign = dir === 'asc' ? 1 : -1;
    return out.sort((a, b) => { const av = a[sortCol], bv = b[sortCol]; if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign || a.id.localeCompare(b.id); return String(av).localeCompare(String(bv)) * sign || a.id.localeCompare(b.id); });
  }, [tasks, status, model, phase, sortCol, dir, map]);

  const sortBy = (col: Col) => { if (col === sortCol) setDir((d) => (d === 'asc' ? 'desc' : 'asc')); else { setSortCol(col); setDir('asc'); } };
  const live = useLatest({ sortBy, rows });
  useActions('K-02', {
    'plan.filter': (p) => { if (p?.status != null) setStatus(p.status === 'all' ? 'all' : (String(p.status) as TaskStatus)); if (p?.model != null) setModel(p.model === 'all' ? 'all' : (String(p.model) as ModelName)); if (p?.phase != null) setPhase(p.phase === 'all' ? 'all' : Number(p.phase)); return { shown: live.current.rows.length }; },
    'plan.sortList': (p) => { const col = (COLS.includes(String(p?.column) as Col) ? (String(p?.column) as Col) : 'id'); live.current.sortBy(col); return { column: col }; },
    'plan.openTask': (p) => { nav(`/plan/tasks/${String(p?.task ?? '')}`); return { ok: true }; },
  });

  /** Header sort lives in the DataTable (aria-sort + glyph); the chip row below stays as the card-mode (< 768) control. */
  const h = (col: Col) => t(LABEL_KEY[col]);
  const sort: SortState = { key: sortCol, dir };
  const onSort = (s: SortState) => { if (COLS.includes(s.key as Col)) { setSortCol(s.key as Col); setDir(s.dir); } };
  const columns: Column<Row>[] = [
    { key: 'id', header: h('id'), sortable: true, width: '88px', render: (r) => <code>{r.id}</code> },
    { key: 'title', header: h('title'), sortable: true },
    { key: 'module', header: h('module'), sortable: true, render: (r) => <span className="xs">{r.module}</span> },
    { key: 'codes', header: h('codes'), sortable: true, render: (r) => (r.codeList.length ? <span className="row wrap xs"><CodeChips codes={r.codeList} /></span> : <span className="faint">&mdash;</span>) },
    { key: 'model', header: h('model'), sortable: true, render: (r) => <ModelBadge model={r.model} /> },
    { key: 'phase', header: h('phase'), sortable: true, align: 'right', width: '76px' },
    { key: 'depends_on', header: h('depends_on'), sortable: true, render: (r) => (r.deps.length ? <span className="row wrap xs">{r.deps.map((d) => <Link key={d} to={`/plan/tasks/${d}`} className={map[d]?.status === 'done' ? 'pl-dep is-done' : 'pl-dep is-open'} title={map[d]?.title}><code>{d}</code></Link>)}</span> : <span className="faint">&mdash;</span>) },
    { key: 'status', header: h('status'), sortable: true, render: (r) => <span className="row wrap xs"><Badge status={r.status} size="sm">{t(`plan.lane_${r.status}`)}</Badge>{r.status !== 'done' && r.ready && <Badge tone="success" size="sm">{t('plan.ready_yes')}</Badge>}</span> },
    { key: 'owner', header: h('owner'), sortable: true, hideOnCard: true, render: (r) => <span className="xs">{r.owner}</span> },
  ];

  const done = tasks.filter((x) => x.status === 'done').length;
  return (<div className="container container-wide page stack">
    <div className="page-head">
      <div className="stack-sm"><h1>K-02 · {t('plan.k02_title')}</h1><p className="muted small">{t('plan.tagline')}</p></div>
      <nav className="pl-views row wrap xs" aria-label={t('plan.views')}><Link to="/plan">{t('plan.view_kanban')}</Link><span className="faint">·</span><Link to="/plan/timeline">{t('plan.view_timeline')}</Link></nav>
    </div>

    <div className="grid grid-4 pl-stats">
      <Stat label={t('plan.tasks')} value={tasks.length} />
      <Stat label={t('plan.shown')} value={rows.length} />
      <Stat label={t('plan.done')} value={done} tone="success" />
      <Stat label={t('plan.ready')} value={tasks.filter((x) => x.status !== 'done' && readiness(x, map).ready).length} tone="accent" hint={t('plan.ready_hint')} />
    </div>

    <div className="row wrap pl-filters" role="group" aria-label={t('plan.filters')}>
      <span className="eyebrow">{t('plan.status')}</span>
      <Chip selected={status === 'all'} onClick={() => setStatus('all')}>{t('plan.all')}</Chip>
      {LANES.map((l) => <Chip key={l} selected={status === l} onClick={() => setStatus(l)}>{t(`plan.lane_${l}`)}</Chip>)}
      <span className="faint">|</span>
      <span className="eyebrow">{t('plan.model')}</span>
      <Chip selected={model === 'all'} onClick={() => setModel('all')}>{t('plan.all')}</Chip>
      {MODEL_LIST.map((m) => <Chip key={m} selected={model === m} onClick={() => setModel(m)}>{m}</Chip>)}
      <span className="faint">|</span>
      <span className="eyebrow">{t('plan.phase')}</span>
      <Chip selected={phase === 'all'} onClick={() => setPhase('all')}>{t('plan.all')}</Chip>
      {phases.map((p) => <Chip key={p} selected={phase === p} onClick={() => setPhase(p)}>{p}</Chip>)}
      <span className="grow" />
      <IconButton icon="refresh" label={t('plan.clear_filters')} variant="outline" size="sm" onClick={() => { setStatus('all'); setModel('all'); setPhase('all'); setSortCol('id'); setDir('asc'); }} />
    </div>

    <div className="row wrap pl-sorts" role="group" aria-label={t('plan.sort')}>
      <span className="eyebrow">{t('plan.sort')}</span>
      {COLS.map((c) => <Chip key={c} selected={sortCol === c} onClick={() => sortBy(c)}>{t(LABEL_KEY[c])}{sortCol === c ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}</Chip>)}
      <IconButton icon={dir === 'asc' ? 'arrow-up' : 'arrow-down'} label={t(dir === 'asc' ? 'plan.asc' : 'plan.desc')} variant="outline" size="sm" onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))} />
    </div>

    <DataTable<Row> caption={t('plan.k02_title')} rows={rows} sort={sort} onSort={onSort} rowHref={(r) => `/plan/tasks/${r.id}`} onRowClick={(r) => nav(`/plan/tasks/${r.id}`)} empty={{ title: t('plan.empty_title'), body: t('plan.empty_body') }} columns={columns} />
    <p className="xs muted">{t('plan.list_hint')}</p>
  </div>);
}
