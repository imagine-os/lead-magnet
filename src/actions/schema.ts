/**
 * Pure helpers shared by the runtime WebMCP surface (src/actions/webmcp.ts) and the CLI (scripts/actions.mjs, which
 * imports this file under Node 22 --experimental-strip-types). Keep it free of runtime imports and of TS syntax that
 * type stripping cannot erase (no enums, namespaces or parameter properties): types only.
 */
import type { ActionDef } from '../specs/types';

export type ParamType = NonNullable<ActionDef['params']>[string];
export interface JsonSchemaProp { type: 'string' | 'number'; description?: string; enum?: string[]; format?: string }
export interface JsonSchema { type: 'object'; properties: Record<string, JsonSchemaProp>; required: string[]; additionalProperties: boolean }

/** A route as the manifest publishes it (structural, so Node can pass plain objects). */
export interface ManifestRouteLike { path: string; code: string; surface?: string; status?: 'built' | 'stub'; spec: { code: string; actions: ActionDef[] } }
export interface ToolHost { code: string; path: string; status?: 'built' | 'stub' }
/** One WebMCP tool per unique action id; an id shared by several pages has several hosts. */
export interface ToolSpec {
  name: string; label: string; intent: string; description: string;
  permission?: string; params: Record<string, ParamType>; inputSchema: JsonSchema; hosts: ToolHost[];
}
export interface VocabularyEntry { phrase: string; action: string; slots: Record<string, ParamType>; pages: string[]; permission?: string }

const DESCRIBE: Record<string, string> = { string: 'free text', number: 'a number', id: 'a row id (never a screen position)', date: 'an ISO 8601 instant' };

/** `params` -> JSON Schema. Every slot is optional: handlers default missing ones (a bus call may carry only what the speaker said). */
export function paramSchema(params?: Record<string, ParamType>): JsonSchema {
  const properties: Record<string, JsonSchemaProp> = {};
  for (const [key, type] of Object.entries(params ?? {})) {
    if (type.startsWith('enum:')) properties[key] = { type: 'string', enum: type.slice(5).split('|'), description: `one of ${type.slice(5).split('|').join(', ')}` };
    else if (type === 'number') properties[key] = { type: 'number', description: DESCRIBE.number };
    else if (type === 'date') properties[key] = { type: 'string', format: 'date-time', description: DESCRIBE.date };
    else properties[key] = { type: 'string', description: DESCRIBE[type] ?? DESCRIBE.string };
  }
  return { type: 'object', properties, required: [], additionalProperties: false };
}

/** Validates params against the schema. Returns readable problems (empty = fine); coerces numbers in place. */
export function validateParams(schema: JsonSchema, params: Record<string, unknown>): string[] {
  const problems: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    const p = schema.properties[k];
    if (!p) { if (!schema.additionalProperties) problems.push(`unknown param "${k}"`); continue; }
    if (v == null || v === '') continue;
    if (p.type === 'number') { const n = Number(v); if (Number.isNaN(n)) problems.push(`"${k}" must be a number`); else params[k] = n; }
    else if (p.enum && !p.enum.includes(String(v))) problems.push(`"${k}" must be one of ${p.enum.join(', ')}`);
    else if (p.format === 'date-time' && Number.isNaN(Date.parse(String(v)))) problems.push(`"${k}" must be an ISO 8601 date`);
  }
  return problems;
}

export const toolDescription = (a: ActionDef, hosts: ToolHost[]) => `${a.intent} — "${a.label}" on ${hosts.map((h) => h.code).join(', ')} (${a.permission ? `needs ${a.permission}` : 'any role'})`;

/** The manifest flattened to one tool per unique action id, hosts merged, sorted by name. */
export function buildToolSpecs(routes: ManifestRouteLike[]): ToolSpec[] {
  const byId = new Map<string, { action: ActionDef; hosts: ToolHost[] }>();
  for (const r of routes) for (const a of r.spec.actions) {
    const e = byId.get(a.id) ?? { action: a, hosts: [] };
    if (!e.hosts.some((h) => h.path === r.path)) e.hosts.push({ code: r.spec.code, path: r.path, status: r.status });
    if (!e.action.params && a.params) e.action = a;
    byId.set(a.id, e);
  }
  return [...byId.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, { action, hosts }]) => ({
    name, label: action.label, intent: action.intent, description: toolDescription(action, hosts), permission: action.permission, params: action.params ?? {}, inputSchema: paramSchema(action.params), hosts,
  }));
}

/** Intent phrases -> action ids with their slots: the voice controller's vocabulary (T46) and the CLI's help. */
export function buildVocabulary(tools: ToolSpec[]): VocabularyEntry[] {
  return tools.map((t) => ({ phrase: t.intent, action: t.name, slots: t.params, pages: t.hosts.map((h) => h.code), permission: t.permission }));
}

/** Slot names inside an intent phrase: 'set {task} to {status}' -> ['task', 'status']. */
export const intentSlots = (intent: string): string[] => [...intent.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

/** Deterministic key for the idempotency guard: sorted keys, FNV-1a over the JSON. */
export function stableHash(value: unknown): string {
  const json = JSON.stringify(value ?? null, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : v));
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) { h ^= json.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

/** Fills `:param` and `*` segments of a route path through `resolve`; a segment that cannot be resolved becomes 'x'. */
export function fillRoutePath(path: string, resolve: (name: string) => string | undefined): string {
  return path.replace(/:(\w+)|\*/g, (_m, name: string | undefined) => (name ? resolve(name) ?? 'x' : resolve('*') ?? '')).replace(/\/+$/, '') || '/';
}

/** Prefers a host the current role can open without params, then one whose params the call supplies, then the first. */
export function pickHost(tool: ToolSpec, params: Record<string, unknown>, canOpen: (h: ToolHost) => boolean = () => true): ToolHost | undefined {
  const usable = tool.hosts.filter((h) => h.status !== 'stub' && canOpen(h));
  const pool = usable.length ? usable : tool.hosts;
  const needs = (h: ToolHost) => [...h.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
  return pool.find((h) => needs(h).length === 0) ?? pool.find((h) => needs(h).every((n) => params[n] != null)) ?? pool[0];
}
