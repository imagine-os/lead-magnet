import { defineSpec, type PageSpec } from '../../specs/types';
import type { Role } from '../../auth/roles';
import { STAFF_ROLES } from '../../auth/roles';

export const PLAN_ROLES: Role[] = STAFF_ROLES;
const base = { roles: PLAN_ROLES, data: ['tasks'], integrations: [] as string[], checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840] };
const filterAction = { id: 'plan.filter', label: 'Filter', intent: 'show {phase} tasks for {model}', params: { phase: 'string', model: 'string', status: 'enum:all|backlog|doing|done|blocked|awaiting_justin', ready: 'string' } } as const;
const moveAction = { id: 'plan.moveTask', label: 'Move', intent: 'move {task} to {status}', params: { task: 'id', status: 'enum:backlog|doing|done|blocked|awaiting_justin' }, permission: 'plan.edit' } as const;
const setStatusAction = { id: 'plan.setStatus', label: 'Set status', intent: 'set {task} to {status}', params: { task: 'id', status: 'enum:backlog|doing|done|blocked|awaiting_justin' }, permission: 'plan.edit' } as const;
const openAction = { id: 'plan.openTask', label: 'Open task', intent: 'open task {task}', params: { task: 'id' } } as const;

export const specs: Record<string, PageSpec> = {
  kanban: defineSpec({
    ...base, code: 'K-01', name: 'Plan Kanban', tone: 'home',
    purpose: 'The development plan as five lanes (backlog, doing, done, blocked, awaiting Justin). Each card names its model, its page codes, how many dependencies it waits on and whether it is ready to start; moving a lane writes tasks.status through the provider.',
    layout: ['counts + progress', 'filters (phase, model, ready)', 'lanes', 'cards (id, title, module, model badge, codes, dependencies, ready)', 'move controls (Select + prev / next lane)'],
    logic: ['ready = every dependency done (R-K04)', 'done is refused while a dependency is open (R-K01)', 'done_at stamped on done, cleared on any move out', 'lanes read TASK_STATUS so the vocabulary cannot drift (R-K03)', 'writes by id through useData().update (P-14)'],
    components: ['Card', 'Badge', 'Chip', 'Select', 'IconButton', 'Stat', 'ProgressBar', 'Tooltip', 'EmptyState', 'Placeholder'],
    actions: [moveAction, filterAction, openAction, { id: 'plan.syncBuildPlan', label: 'Sync to build-plan.md', intent: 'write the plan back to docs/build-plan.md' }],
    rules: ['R-K01', 'R-K02', 'R-K03', 'R-K04'], states: ['default', 'filtered', 'empty lane', 'read-only (no plan.edit)'],
  }),
  list: defineSpec({
    ...base, code: 'K-02', name: 'Plan list', tone: 'list',
    purpose: 'Every task in one sortable table: id, title, module, codes, model, phase, dependencies, status, owner. Filters by status, model and phase; a row opens the task detail.',
    layout: ['counts', 'filters (status, model, phase)', 'DataTable (sortable columns)'],
    logic: ['sort by any column, ascending / descending, dependency count sorts numerically', 'ready shown per row from readiness() (R-K04)', 'row click and the first cell link both open K-04'],
    components: ['DataTable', 'Chip', 'Badge', 'Select', 'Stat', 'EmptyState'],
    actions: [filterAction, openAction, { id: 'plan.sortList', label: 'Sort', intent: 'sort the plan by {column}', params: { column: 'string' } }],
    rules: ['R-K02', 'R-K03', 'R-K04'], states: ['default', 'filtered', 'empty'],
  }),
  timeline: defineSpec({
    ...base, code: 'K-03', name: 'Plan timeline', tone: 'list',
    purpose: 'The dependency graph: phases 0..4 as columns, tasks as nodes in topological order, depends_on as arrows. Tasks are bound by dependencies, not calendar days - there is no date axis. Focusing a node highlights everything upstream and downstream and shows its details.',
    layout: ['title + critical-path count', 'filters (phase, model)', 'zoom controls', 'SVG graph (phase bands, nodes, arrowed edges)', 'focused task Card', 'legend'],
    logic: ['columns = phase, sub-columns = same-phase dependency depth, rows = topological order', 'critical path = longest chain of dependencies (count of tasks, not days)', 'focus highlights transitive upstream + downstream and dims the rest', 'nodes are role=button, focusable, Enter / Space focuses; tab order runs phase by phase', 'zoom with buttons and + / - keys; the graph scrolls horizontally inside its own container, never the page'],
    components: ['Card', 'Badge', 'Chip', 'Button', 'IconButton', 'Select', 'Stat', 'Tooltip'],
    actions: [{ id: 'plan.focusTask', label: 'Focus', intent: 'focus task {task}', params: { task: 'id' } }, { id: 'plan.zoomGraph', label: 'Zoom', intent: 'zoom the dependency graph to {percent}', params: { percent: 'number' } }, filterAction, openAction],
    rules: ['R-K01', 'R-K02', 'R-K04'], states: ['default', 'focused', 'filtered', 'zoomed'],
  }),
  task: defineSpec({
    ...base, code: 'K-04', name: 'Task detail', tone: 'form',
    purpose: 'One task: model, phase, module, codes, notes, the tasks it waits on and the tasks waiting on it (both linked), and the status Select that writes the change.',
    layout: ['header (id, title, status, model, phase)', 'status Select + ready state', 'facts (module, owner, codes, done_at)', 'notes', 'waits on (upstream)', 'blocks (dependents)', 'links to K-01 / K-03'],
    logic: ['status change goes through statusChange() so R-K01 refuses done with open dependencies', 'done_at stamped / cleared with the status', 'unknown id renders an empty state with a link back to the Kanban'],
    components: ['Card', 'Badge', 'Chip', 'Select', 'Field', 'Button', 'EmptyState'],
    actions: [setStatusAction, openAction],
    rules: ['R-K01', 'R-K02', 'R-K03', 'R-K04'], states: ['default', 'not found', 'read-only (no plan.edit)'],
  }),
};
