/**
 * Actions bus (P-05). Pages register handlers for the ActionDefs in their spec while mounted; /#/dev/actions lists every
 * action with page, permission and handler-live status. The manifest (window.__leadmagnet.routes[].spec.actions) is the
 * WebMCP surface (one tool per action: name = id, description = intent, inputSchema from params) and the voice vocabulary.
 */
import { useEffect } from 'react';

export type ActionHandler = (params?: Record<string, unknown>) => unknown | Promise<unknown>;
const handlers = new Map<string, { pageCode: string; fn: ActionHandler }>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function registerActions(pageCode: string, map: Record<string, ActionHandler>): () => void {
  for (const [id, fn] of Object.entries(map)) handlers.set(id, { pageCode, fn });
  notify();
  return () => { for (const id of Object.keys(map)) if (handlers.get(id)?.pageCode === pageCode) handlers.delete(id); notify(); };
}
export async function run(id: string, params?: Record<string, unknown>): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const h = handlers.get(id);
  if (!h) return { ok: false, error: `no live handler for ${id} (open its page first)` };
  try { return { ok: true, result: await h.fn(params) }; } catch (e) { return { ok: false, error: String((e as Error).message ?? e) }; }
}
export const isLive = (id: string) => handlers.has(id);
export const liveActions = () => [...handlers.entries()].map(([id, h]) => ({ id, pageCode: h.pageCode }));
export function onActionsChange(cb: () => void): () => void { listeners.add(cb); return () => { listeners.delete(cb); }; }
/** Hook: register while mounted. */
export function useActions(pageCode: string, map: Record<string, ActionHandler>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => registerActions(pageCode, map), [pageCode]);
}
/** Every declared action across the route manifest, with live status. Import lazily from registry to avoid cycles. */
export async function listActions() {
  const { getRoutes } = await import('../app/registry');
  return getRoutes().flatMap((r) => r.spec.actions.map((a) => ({ ...a, pageCode: r.spec.code, path: r.path, surface: r.surface, live: isLive(a.id) })));
}
