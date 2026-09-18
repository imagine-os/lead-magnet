/**
 * track(type, meta) writes an `events` row through the DataProvider with a per-tab session id (sessionStorage).
 * Landing pages call it for view / section_view / scroll_depth / cta_click / demo_open / ...; the admin module reads it.
 */
import type { DataProvider } from '../data/provider';
import type { EventType } from '../data/schema/core';

const SID_KEY = 'leadmagnet.sid';
let provider: DataProvider | null = null;
export function bindTracking(p: DataProvider) { provider = p; }
export function sessionId(): string {
  try { let s = sessionStorage.getItem(SID_KEY); if (!s) { s = `s_${Math.random().toString(36).slice(2, 10)}`; sessionStorage.setItem(SID_KEY, s); } return s; } catch { return 's_anon'; }
}
export interface TrackCtx { page_id?: string | null; prospect_id?: string | null }
export async function track(type: EventType, meta: Record<string, unknown> = {}, ctx: TrackCtx = {}): Promise<void> {
  if (!provider) return;
  await provider.insert('events', { page_id: ctx.page_id ?? null, prospect_id: ctx.prospect_id ?? null, session_id: sessionId(), type, meta, ts: new Date().toISOString() });
}
/** Dedupe helper for section_view / scroll_depth so a page emits each once per session. */
const seen = new Set<string>();
export function trackOnce(key: string, type: EventType, meta: Record<string, unknown> = {}, ctx: TrackCtx = {}) {
  const k = `${sessionId()}|${ctx.page_id ?? ''}|${key}`;
  if (seen.has(k)) return; seen.add(k); void track(type, meta, ctx);
}
