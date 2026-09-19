/**
 * Actions bus (P-05). Pages register handlers for the ActionDefs in their spec while mounted; /#/dev/actions lists every
 * action with page, permission and handler-live status. The manifest (window.__leadmagnet.routes[].spec.actions) is the
 * WebMCP surface (one tool per action: name = id, description = intent, inputSchema from params) and the voice vocabulary.
 */
import { useEffect, useRef } from 'react';

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
/** A ref that always holds the latest value (for handlers registered once that must read current state). */
export function useLatest<T>(value: T): { readonly current: T } { const ref = useRef(value); ref.current = value; return ref; }
/**
 * Hook: register while mounted. Registration happens once per page code, but every handler is a stable wrapper that
 * calls the function from the LATEST render, so a bus / WebMCP / voice call sees current state (D-008 makes stale
 * handlers a correctness bug, not a nit). Ids are taken from the first render's map.
 */
export function useActions(pageCode: string, map: Record<string, ActionHandler>) {
  const latest = useLatest(map);
  useEffect(() => {
    const stable = Object.fromEntries(Object.keys(latest.current).map((id) => [id, (p?: Record<string, unknown>) => latest.current[id]?.(p)])) as Record<string, ActionHandler>;
    return registerActions(pageCode, stable);
  }, [pageCode, latest]);
}
/** Every declared action across the route manifest, with live status. Import lazily from registry to avoid cycles. */
export async function listActions() {
  const { getRoutes } = await import('../app/registry');
  return getRoutes().flatMap((r) => r.spec.actions.map((a) => ({ ...a, pageCode: r.spec.code, path: r.path, surface: r.surface, live: isLive(a.id) })));
}
