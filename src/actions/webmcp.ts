/**
 * WebMCP surface (T45, P-05): one tool per action in the manifest, registered through `navigator.modelContext.registerTool`
 * when the browser has it (W3C Web Machine Learning CG proposal; feature-detected, never assumed) and ALWAYS exposed as
 * `window.__leadmagnet.tools` + `window.__leadmagnet.runAction(id, params)` so Playwright, the CLI (`npm run actions`) and
 * the voice controller (T46) share one entry point. See docs/reference/control.md.
 *
 * execute(params): (a) `can(permission)` for the current session -> (b) if no live handler, navigate to the action's
 * page (route params resolved from `params`, else the first seeded row) and wait for it to register -> (c) `run(id, params)`.
 * Idempotency: the same (id, params) within IDEMPOTENCY_WINDOW_MS returns the first call's result instead of running the
 * handler twice (handlers may be non-idempotent; a double-tap on a remote or a repeated voice phrase must not double-write).
 */
import { isLive, onActionsChange, run } from './index';
import { buildToolSpecs, buildVocabulary, fillRoutePath, pickHost, stableHash, validateParams, type ManifestRouteLike, type ToolHost, type ToolSpec, type VocabularyEntry } from './schema';
import type { Permission } from '../auth/permissions';

export interface ToolResult { ok: boolean; message: string; data?: unknown; /** true when the idempotency guard answered from the previous call */ deduped?: boolean }
export interface Tool extends ToolSpec { execute: (params?: Record<string, unknown>) => Promise<ToolResult>; live: boolean }
export interface WebMcpStatus { /** navigator.modelContext.registerTool exists */ available: boolean; registered: 'navigator' | 'window'; count: number; live: number; updatedAt: string }
/** What the React tree lends the bus: session, router and seeded defaults. Installed by src/app/ControlBridge.tsx. */
export interface ControlBridge {
  can: (permission: Permission) => boolean; role: string;
  navigate: (path: string) => void; currentPath: () => string;
  /** Value for a route param (`slug`, `prospectId`, `id`, ...) given the call's params; undefined = unknown. */
  resolveParam: (name: string, hostPath: string, params: Record<string, unknown>) => string | undefined;
  canOpen: (host: ToolHost) => boolean;
}
interface ModelContext { registerTool?: (tool: { name: string; description: string; inputSchema: unknown; annotations?: Record<string, unknown>; execute: (params: Record<string, unknown>) => Promise<unknown> }) => void; unregisterTool?: (name: string) => void }
export interface LeadMagnetControl { tools: Tool[]; vocabulary: VocabularyEntry[]; runAction: (id: string, params?: Record<string, unknown>) => Promise<ToolResult>; webmcp: WebMcpStatus }

export const IDEMPOTENCY_WINDOW_MS = 1500;
export const REGISTER_TIMEOUT_MS = 4000;

let bridge: ControlBridge | null = null;
let tools: Tool[] = [];
let vocabulary: VocabularyEntry[] = [];
const inNavigator = new Set<string>();
const recent = new Map<string, { at: number; promise: Promise<ToolResult> }>();
const listeners = new Set<() => void>();

export function installControlBridge(b: ControlBridge | null): void { bridge = b; }
export const getTools = (): Tool[] => tools;
export const getTool = (id: string): Tool | undefined => tools.find((t) => t.name === id);
export function onToolsChange(cb: () => void): () => void { listeners.add(cb); return () => { listeners.delete(cb); }; }

const modelContext = (): ModelContext | null => (typeof navigator !== 'undefined' ? ((navigator as unknown as { modelContext?: ModelContext }).modelContext ?? null) : null);
export const webmcpAvailable = (): boolean => typeof modelContext()?.registerTool === 'function';
export function webmcpStatus(): WebMcpStatus {
  const available = webmcpAvailable();
  return { available, registered: available && inNavigator.size > 0 ? 'navigator' : 'window', count: tools.length, live: tools.filter((t) => t.live).length, updatedAt: new Date().toISOString() };
}

function waitLive(id: string, ms: number): Promise<boolean> {
  if (isLive(id)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const off = onActionsChange(() => { if (isLive(id)) { clearTimeout(timer); off(); resolve(true); } });
    const timer = window.setTimeout(() => { off(); resolve(false); }, ms);
  });
}

async function executeOnce(tool: Tool, params: Record<string, unknown>): Promise<ToolResult> {
  if (!bridge) return { ok: false, message: 'the control bridge is not mounted yet (app still starting)' };
  if (tool.permission && !bridge.can(tool.permission as Permission)) return { ok: false, message: `"${tool.name}" needs ${tool.permission}; the current role (${bridge.role}) does not have it` };
  const problems = validateParams(tool.inputSchema, params);
  if (problems.length) return { ok: false, message: `invalid params for ${tool.name}: ${problems.join('; ')}`, data: { schema: tool.inputSchema } };
  let opened: string | null = null;
  if (!isLive(tool.name)) {
    const host = pickHost(tool, params, bridge.canOpen);
    if (!host) return { ok: false, message: `${tool.name} has no page that registers it` };
    const path = fillRoutePath(host.path, (n) => bridge!.resolveParam(n, host.path, params));
    if (bridge.currentPath() !== path) bridge.navigate(path);
    opened = `${host.code} ${path}`;
    if (!(await waitLive(tool.name, REGISTER_TIMEOUT_MS))) return { ok: false, message: `opened ${opened} but ${tool.name} did not register a handler within ${REGISTER_TIMEOUT_MS / 1000} s (role ${bridge.role} may not open that page)` };
  }
  const r = await run(tool.name, params);
  if (!r.ok) return { ok: false, message: `${tool.name} failed: ${r.error ?? 'unknown error'}` };
  return { ok: true, message: `ran ${tool.name}${opened ? ` (opened ${opened})` : ''}`, data: r.result };
}

/** Idempotency guard: identical (id, params) inside the window share one execution. */
function execute(tool: Tool, params: Record<string, unknown> = {}): Promise<ToolResult> {
  const now = Date.now();
  for (const [k, v] of recent) if (now - v.at > IDEMPOTENCY_WINDOW_MS) recent.delete(k);
  const key = `${tool.name}#${stableHash(params)}`;
  const hit = recent.get(key);
  if (hit) return hit.promise.then((r) => ({ ...r, deduped: true, message: `${r.message} (deduplicated: same call within ${IDEMPOTENCY_WINDOW_MS} ms)` }));
  const promise = executeOnce(tool, { ...params });
  recent.set(key, { at: now, promise });
  return promise;
}

export async function runAction(id: string, params?: Record<string, unknown>): Promise<ToolResult> {
  const tool = getTool(id);
  if (!tool) return { ok: false, message: `unknown action "${id}" (${tools.length} tools; see /#/dev/actions)` };
  return tool.execute(params);
}

function registerInNavigator(tool: Tool): void {
  const mc = modelContext();
  if (!mc || typeof mc.registerTool !== 'function' || inNavigator.has(tool.name)) return;
  try {
    mc.registerTool({
      name: tool.name, description: tool.description, inputSchema: tool.inputSchema,
      annotations: { pages: tool.hosts.map((h) => h.code), permission: tool.permission ?? null, label: tool.label },
      execute: async (p) => { const r = await tool.execute(p ?? {}); return { content: [{ type: 'text', text: JSON.stringify(r) }], structuredContent: r }; },
    });
    inNavigator.add(tool.name);
  } catch (e) { console.warn(`[webmcp] registerTool(${tool.name}) failed`, e); }
}

function publish(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { __leadmagnet?: Partial<LeadMagnetControl> & Record<string, unknown> };
  w.__leadmagnet = Object.assign(w.__leadmagnet ?? {}, { tools, vocabulary, runAction, webmcp: webmcpStatus() } satisfies LeadMagnetControl);
}

/** Builds (or refreshes) the tool set from the route manifest. Called at app start and whenever live handlers change. */
export function syncTools(routes: ManifestRouteLike[]): Tool[] {
  const specs = buildToolSpecs(routes);
  const prev = new Map(tools.map((t) => [t.name, t]));
  tools = specs.map((s) => {
    const existing = prev.get(s.name);
    const tool: Tool = existing ? Object.assign(existing, s, { live: isLive(s.name) }) : { ...s, live: isLive(s.name), execute: (p) => execute(tool, p) };
    return tool;
  });
  vocabulary = buildVocabulary(tools);
  for (const t of tools) registerInNavigator(t);
  publish();
  listeners.forEach((l) => l());
  return tools;
}
