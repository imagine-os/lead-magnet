/** Shared timeline vocabulary for A-01 (recent) and A-02 (one prospect): icons, one-line meta summaries, and the merge. */
import type { IconName } from '../../components/atom/Icon/Icon';
import type { BookingRow, EventRow, EventType, TouchRow } from '../../data/schema/core';

export const EVENT_ICON: Record<EventType, IconName> = {
  view: 'eye', section_view: 'layers', scroll_depth: 'arrow-down', cta_click: 'target', demo_open: 'play', demo_role_switch: 'users',
  booking_started: 'calendar', booking_confirmed: 'check', form_submit: 'edit', exit_intent: 'logout', outreach_open: 'mail', outreach_click: 'external-link',
};
export const CHANNEL_ICON: Record<string, IconName> = { cold_email: 'mail', linkedin_dm: 'message', whatsapp: 'message', sms: 'message', call: 'phone', warm_intro: 'heart' };

export const when = (iso: string): string => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d); };
const short = (v: unknown) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

/** Compact, human meta line for an event; falls back to the first two meta keys so nothing is invisible. */
export function eventSummary(e: EventRow): string {
  const m = (e.meta ?? {}) as Record<string, unknown>;
  const bits: string[] = [];
  if (m.section) bits.push(short(m.section));
  if (m.seconds != null) bits.push(`${short(m.seconds)} s`);
  if (m.depth != null) bits.push(`${Math.round(Number(m.depth) * 100)} %`);
  if (m.cta) bits.push(short(m.cta));
  if (m.role) bits.push(short(m.role));
  if (m.channel) bits.push(short(m.channel));
  if (m.archetype) bits.push(short(m.archetype));
  if (m.slot) bits.push(when(short(m.slot)));
  if (!bits.length) for (const [k, v] of Object.entries(m).slice(0, 2)) bits.push(`${k}: ${short(v)}`);
  return bits.join(' · ');
}

export type TimelineKind = 'touch' | 'event' | 'booking';
export interface TimelineItem { id: string; at: string; kind: TimelineKind; icon: IconName; labelKey: string; labelVars?: Record<string, string>; summary: string; status?: string; session?: string }

/** Touches, events and bookings for one prospect as one list, newest first. A touch is placed at its latest known moment. */
export function buildTimeline(events: EventRow[], touches: TouchRow[], bookings: BookingRow[]): TimelineItem[] {
  const items: TimelineItem[] = [
    ...events.map((e) => ({ id: `ev:${e.id}`, at: String(e.ts ?? e.created_at), kind: 'event' as const, icon: EVENT_ICON[e.type] ?? 'info', labelKey: `admin.ev_${e.type}`, summary: eventSummary(e), session: e.session_id })),
    ...touches.map((c) => ({ id: `tc:${c.id}`, at: String(c.clicked_at ?? c.opened_at ?? c.sent_at ?? c.created_at), kind: 'touch' as const, icon: CHANNEL_ICON[c.channel] ?? 'mail', labelKey: `admin.ch_${c.channel}`, summary: [c.subject, c.sent_at ? `sent ${when(c.sent_at)}` : '', c.opened_at ? `opened ${when(c.opened_at)}` : '', c.clicked_at ? `clicked ${when(c.clicked_at)}` : ''].filter(Boolean).join(' · '), status: c.status })),
    ...bookings.map((b) => ({ id: `bk:${b.id}`, at: String(b.created_at), kind: 'booking' as const, icon: 'calendar' as IconName, labelKey: 'admin.tl_booking', labelVars: { minutes: String(b.duration_min) }, summary: [when(b.slot), b.notes].filter(Boolean).join(' · '), status: b.status })),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at));
}
