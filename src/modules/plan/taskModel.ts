/**
 * Pure helpers for the plan module (K-01..K-04). Tasks are bound by dependencies, not calendar days,
 * so every derived value here comes from `depends_on` and `phase` - never from a date.
 */
import type { BadgeTone } from '../../components/atom/Badge/Badge';
import type { ModelName, TaskRow, TaskStatus } from '../../data/schema/core';
import { MODELS, TASK_STATUS } from '../../data/schema/core';

/** Lane order on K-01 (also the vocabulary R-K03 checks). */
export const LANES: readonly TaskStatus[] = TASK_STATUS;
export const MODEL_LIST: readonly ModelName[] = MODELS;

/** Each model gets its own Badge tone so a lane scans by who is building it. */
export const MODEL_TONE: Record<ModelName, BadgeTone> = { 'Fable 5.1': 'primary', 'Opus 5': 'accent', 'Sonnet 5': 'info', Justin: 'warn' };
/** Node fill per status on the K-03 graph (status tokens, same hues as the Badge `status` prop). */
export const statusVar = (status: TaskStatus, part: 'fg' | 'bg') => `var(--status-${status}-${part}, var(--color-text))`;

export type TaskMap = Record<string, TaskRow>;
export const indexTasks = (tasks: TaskRow[]): TaskMap => Object.fromEntries(tasks.map((t) => [t.id, t]));

export interface Readiness { total: number; done: number; missing: string[]; ready: boolean }
/** A task is ready when every dependency is done (no dependencies = ready). */
export function readiness(task: TaskRow, map: TaskMap): Readiness {
  const deps = task.depends_on ?? [];
  const missing = deps.filter((d) => map[d]?.status !== 'done');
  return { total: deps.length, done: deps.length - missing.length, missing, ready: missing.length === 0 };
}

/** Tasks that name this one in their depends_on. */
export const dependentsOf = (id: string, tasks: TaskRow[]): TaskRow[] => tasks.filter((t) => (t.depends_on ?? []).includes(id));

/** Stable topological order: dependencies first, ties broken by phase then id. Cycles fall back to the tail. */
export function topoOrder(tasks: TaskRow[]): string[] {
  const ids = new Set(tasks.map((t) => t.id));
  const sorted = [...tasks].sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
  const out: string[] = [];
  const placed = new Set<string>();
  let left = sorted;
  while (left.length) {
    const next = left.filter((t) => (t.depends_on ?? []).every((d) => !ids.has(d) || placed.has(d)));
    if (!next.length) { for (const t of left) { out.push(t.id); placed.add(t.id); } break; }
    for (const t of next) { out.push(t.id); placed.add(t.id); }
    left = left.filter((t) => !placed.has(t.id));
  }
  return out;
}

/** Longest chain of dependencies (the critical path: how many tasks deep the plan is). */
export function criticalPath(tasks: TaskRow[]): { length: number; path: string[] } {
  const map = indexTasks(tasks);
  const memo = new Map<string, string[]>();
  const walk = (id: string, seen: Set<string>): string[] => {
    const cached = memo.get(id);
    if (cached) return cached;
    if (seen.has(id)) return [id];
    const t = map[id];
    if (!t) return [];
    let best: string[] = [];
    for (const d of t.depends_on ?? []) {
      if (!map[d]) continue;
      const chain = walk(d, new Set([...seen, id]));
      if (chain.length > best.length) best = chain;
    }
    const full = [...best, id];
    memo.set(id, full);
    return full;
  };
  let best: string[] = [];
  for (const t of tasks) { const chain = walk(t.id, new Set()); if (chain.length > best.length) best = chain; }
  return { length: best.length, path: best };
}

/** Every task this one waits on, transitively. */
export function upstreamOf(id: string, map: TaskMap): Set<string> {
  const out = new Set<string>();
  const walk = (cur: string) => { for (const d of map[cur]?.depends_on ?? []) if (map[d] && !out.has(d)) { out.add(d); walk(d); } };
  walk(id);
  return out;
}
/** Every task that waits on this one, transitively. */
export function downstreamOf(id: string, tasks: TaskRow[]): Set<string> {
  const out = new Set<string>();
  const walk = (cur: string) => { for (const t of tasks) if ((t.depends_on ?? []).includes(cur) && !out.has(t.id)) { out.add(t.id); walk(t.id); } };
  walk(id);
  return out;
}

/** R-K01 gate: nothing is done while a dependency is not done. blocked / awaiting_justin are always allowed (they explain themselves). */
export function statusChange(task: TaskRow, next: TaskStatus, map: TaskMap): { ok: boolean; rule?: string; missing: string[] } {
  const { missing } = readiness(task, map);
  if (next === 'done' && missing.length) return { ok: false, rule: 'R-K01', missing };
  return { ok: true, missing };
}
/** The patch to write through the provider: done stamps done_at, anything else clears it. */
export const statusPatch = (next: TaskStatus): Partial<TaskRow> => ({ status: next, done_at: next === 'done' ? new Date().toISOString() : null });

/** Graph geometry for K-03: phases are column groups, dependencies inside a phase get their own sub-column so every edge points right. */
export const GRAPH = { colW: 260, nodeW: 200, nodeH: 62, rowH: 84, padX: 40, padY: 104 };
export interface GraphNode { task: TaskRow; x: number; y: number; col: number; row: number; phase: number }
export interface GraphEdge { id: string; from: GraphNode; to: GraphNode; cross: boolean }
export interface PhaseBand { phase: number; col: number; cols: number; x: number; width: number }
export interface Graph { nodes: GraphNode[]; edges: GraphEdge[]; bands: PhaseBand[]; width: number; height: number; cols: number }

/** Longest chain of same-phase dependencies ending at each task (its sub-column inside the phase). */
function localDepths(inPhase: TaskRow[]): Record<string, number> {
  const ids = new Set(inPhase.map((t) => t.id));
  const map = indexTasks(inPhase);
  const depth: Record<string, number> = {};
  const walk = (id: string, seen: Set<string>): number => {
    if (depth[id] != null) return depth[id];
    if (seen.has(id)) return 0;
    const deps = (map[id]?.depends_on ?? []).filter((d) => ids.has(d));
    const d = deps.length ? Math.max(...deps.map((x) => walk(x, new Set([...seen, id])) + 1)) : 0;
    depth[id] = d;
    return d;
  };
  for (const t of inPhase) walk(t.id, new Set());
  return depth;
}

export function buildGraph(tasks: TaskRow[]): Graph {
  const phases = [...new Set(tasks.map((t) => t.phase))].sort((a, b) => a - b);
  const order = topoOrder(tasks);
  const rank = new Map(order.map((id, i) => [id, i]));
  const nodes: GraphNode[] = [];
  const bands: PhaseBand[] = [];
  let col = 0;
  for (const phase of phases) {
    const inPhase = tasks.filter((t) => t.phase === phase).sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
    const depth = localDepths(inPhase);
    const cols = inPhase.length ? Math.max(...inPhase.map((t) => depth[t.id] ?? 0)) + 1 : 1;
    const nextRow: number[] = new Array(cols).fill(0);
    for (const task of inPhase) {
      const sub = depth[task.id] ?? 0;
      const row = nextRow[sub]++;
      nodes.push({ task, phase, col: col + sub, row, x: GRAPH.padX + (col + sub) * GRAPH.colW, y: GRAPH.padY + row * GRAPH.rowH });
    }
    bands.push({ phase, col, cols, x: GRAPH.padX + col * GRAPH.colW - 16, width: cols * GRAPH.colW - (GRAPH.colW - GRAPH.nodeW) + 32 });
    col += cols;
  }
  const byId = new Map(nodes.map((n) => [n.task.id, n]));
  const edges: GraphEdge[] = [];
  for (const n of nodes) for (const d of n.task.depends_on ?? []) { const from = byId.get(d); if (from) edges.push({ id: `${d}->${n.task.id}`, from, to: n, cross: from.phase !== n.phase }); }
  const rows = Math.max(1, ...nodes.map((n) => n.row + 1));
  return { nodes, edges, bands, cols: col, width: GRAPH.padX * 2 + Math.max(0, col - 1) * GRAPH.colW + GRAPH.nodeW, height: GRAPH.padY + rows * GRAPH.rowH + 32 };
}

/** Edge path: out of the right edge of `from`, into the left edge of `to`, as a flat cubic. */
export function edgePath(e: GraphEdge): string {
  const x1 = e.from.x + GRAPH.nodeW, y1 = e.from.y + GRAPH.nodeH / 2, x2 = e.to.x - 8, y2 = e.to.y + GRAPH.nodeH / 2;
  const mid = x1 + (x2 - x1) / 2;
  return `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
}
