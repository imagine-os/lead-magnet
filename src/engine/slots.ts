/**
 * Slot contract shared by the landing inline calendar (L-0x booking_inline), B-01 and A-05 (pure, no DOM).
 * Mock availability: deterministic per prospect (same grid on every machine, no clock drift inside a day), in the
 * prospect's likely timezone derived from their city. A real provider (Cal.com / Calendly) replaces `slotGrid` in T42
 * behind the same shape: { tz, days: SlotDay[] } of 15-minute slots with an ISO instant. Everything that shows a slot
 * imports from here, so a slot never reads differently on the landing page, the booking page and the admin list.
 */
import type { ProspectRow } from '../data/schema/core';

export interface Tz { id: string; abbr: string }
export interface Slot { iso: string; hhmm: string; hour: number; minute: number; available: boolean; /** Asked for via ?slot= but not in the generated grid (or generated as busy): kept and marked, never silently swapped. */ requested?: boolean }
export interface SlotDay { key: string; year: number; month: number; day: number; weekday: number; closed: boolean; slots: Slot[] }
export interface SlotGrid { tz: Tz; days: SlotDay[] }

/** City -> likely timezone. Unknown cities fall back per country, then to America/New_York. */
const CITY_TZ: Record<string, Tz> = {
  austin: { id: 'America/Chicago', abbr: 'CT' }, dallas: { id: 'America/Chicago', abbr: 'CT' }, houston: { id: 'America/Chicago', abbr: 'CT' }, 'san antonio': { id: 'America/Chicago', abbr: 'CT' }, chicago: { id: 'America/Chicago', abbr: 'CT' }, nashville: { id: 'America/Chicago', abbr: 'CT' }, 'mexico city': { id: 'America/Mexico_City', abbr: 'CT' }, monterrey: { id: 'America/Monterrey', abbr: 'CT' },
  miami: { id: 'America/New_York', abbr: 'ET' }, orlando: { id: 'America/New_York', abbr: 'ET' }, tampa: { id: 'America/New_York', abbr: 'ET' }, atlanta: { id: 'America/New_York', abbr: 'ET' }, 'new york': { id: 'America/New_York', abbr: 'ET' }, boston: { id: 'America/New_York', abbr: 'ET' }, philadelphia: { id: 'America/New_York', abbr: 'ET' }, charlotte: { id: 'America/New_York', abbr: 'ET' }, 'san juan': { id: 'America/Puerto_Rico', abbr: 'AST' },
  denver: { id: 'America/Denver', abbr: 'MT' }, boulder: { id: 'America/Denver', abbr: 'MT' }, 'salt lake city': { id: 'America/Denver', abbr: 'MT' }, albuquerque: { id: 'America/Denver', abbr: 'MT' }, phoenix: { id: 'America/Phoenix', abbr: 'MST' },
  'los angeles': { id: 'America/Los_Angeles', abbr: 'PT' }, 'san diego': { id: 'America/Los_Angeles', abbr: 'PT' }, 'san francisco': { id: 'America/Los_Angeles', abbr: 'PT' }, seattle: { id: 'America/Los_Angeles', abbr: 'PT' }, portland: { id: 'America/Los_Angeles', abbr: 'PT' }, 'las vegas': { id: 'America/Los_Angeles', abbr: 'PT' },
  madrid: { id: 'Europe/Madrid', abbr: 'CET' }, barcelona: { id: 'Europe/Madrid', abbr: 'CET' }, london: { id: 'Europe/London', abbr: 'GMT' },
};
const COUNTRY_TZ: Record<string, Tz> = { US: { id: 'America/New_York', abbr: 'ET' }, MX: { id: 'America/Mexico_City', abbr: 'CT' }, ES: { id: 'Europe/Madrid', abbr: 'CET' }, CA: { id: 'America/Toronto', abbr: 'ET' } };

export function tzForProspect(p: Pick<ProspectRow, 'city' | 'country'>): Tz {
  return CITY_TZ[(p.city ?? '').trim().toLowerCase()] ?? COUNTRY_TZ[(p.country ?? '').toUpperCase()] ?? { id: 'America/New_York', abbr: 'ET' };
}

/** Minutes that `tzId` is offset from UTC at that instant (handles DST, no library). */
function offsetMinutes(tzId: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tzId, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(at);
  const get = (type: string) => Number(parts.find((x) => x.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - at.getTime()) / 60000);
}
/** A wall-clock time in `tzId` -> the UTC instant. Two passes so a DST boundary resolves. */
export function zonedInstant(tzId: string, y: number, m: number, d: number, h: number, min: number): Date {
  const wall = Date.UTC(y, m - 1, d, h, min);
  let ts = wall - offsetMinutes(tzId, new Date(wall)) * 60000;
  ts = wall - offsetMinutes(tzId, new Date(ts)) * 60000;
  return new Date(ts);
}
/** Calendar date in `tzId` for an instant. */
function zonedDate(tzId: string, at: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tzId, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at);
  const get = (type: string) => Number(parts.find((x) => x.type === type)?.value ?? 0);
  return { year: get('year'), month: get('month'), day: get('day') };
}
/** FNV-1a: the same prospect always sees the same free slots. */
function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export const DURATION_MIN = 15;
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 17;
const LUNCH_HOUR = 12;
const FREE_PCT = 42;

/** Next `days` days (from tomorrow) of 15-minute slots in working hours, weekends closed, lunch blocked. */
export function slotGrid(prospectId: string, tz: Tz, from: Date = new Date(), days = 7): SlotGrid {
  const out: SlotDay[] = [];
  for (let i = 1; i <= days; i++) {
    const { year, month, day } = zonedDate(tz.id, new Date(from.getTime() + i * 86400000));
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const closed = weekday === 0 || weekday === 6;
    const slots: Slot[] = [];
    if (!closed) {
      for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
        if (h === LUNCH_HOUR) continue;
        for (let min = 0; min < 60; min += DURATION_MIN) {
          const hhmm = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          slots.push({ iso: zonedInstant(tz.id, year, month, day, h, min).toISOString(), hhmm, hour: h, minute: min, available: hash(`${prospectId}|${key}|${hhmm}`) % 100 < FREE_PCT });
        }
      }
      // Never show a working day with nothing on it.
      if (!slots.some((s) => s.available)) for (const s of slots) if (s.hhmm === '10:00' || s.hhmm === '14:00') s.available = true;
    }
    out.push({ key, year, month, day, weekday, closed, slots });
  }
  return { tz, days: out };
}

export const findSlot = (grid: SlotGrid, iso: string | null): Slot | null => (iso ? grid.days.flatMap((d) => d.slots).find((s) => s.iso === iso && s.available) ?? null : null);

/** A parseable ISO instant, normalised to the exact string `slotGrid` would produce (so `===` comparisons hold). */
export function normalizeSlotIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

/**
 * B-01 contract for `?slot=`: any valid instant is honoured. If it is in the grid it is marked available (the prospect
 * asked for it); if the grid does not have it (different minute, outside the window, a closed day) it is appended in
 * its day, flagged `requested`, so the page preselects exactly what the landing page offered instead of guessing.
 */
export function withRequested(grid: SlotGrid, iso: string | null | undefined): SlotGrid {
  const want = normalizeSlotIso(iso);
  if (!want) return grid;
  const at = new Date(want);
  const { year, month, day } = zonedDate(grid.tz.id, at);
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: grid.tz.id, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(at);
  const hour = Number(parts.find((x) => x.type === 'hour')?.value ?? 0); const minute = Number(parts.find((x) => x.type === 'minute')?.value ?? 0);
  const slot: Slot = { iso: want, hhmm: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, hour, minute, available: true, requested: true };
  const days = grid.days.map((d) => ({ ...d, slots: [...d.slots] }));
  let dayRow = days.find((d) => d.key === key);
  if (!dayRow) {
    dayRow = { key, year, month, day, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(), closed: false, slots: [] };
    days.push(dayRow); days.sort((a, b) => a.key.localeCompare(b.key));
  }
  const i = dayRow.slots.findIndex((s) => s.iso === want);
  if (i >= 0) dayRow.slots[i] = { ...dayRow.slots[i], available: true, requested: dayRow.slots[i].available ? undefined : true };
  else { dayRow.slots.push(slot); dayRow.slots.sort((a, b) => a.iso.localeCompare(b.iso)); dayRow.closed = false; }
  return { tz: grid.tz, days };
}

/**
 * The landing page's inline preview: up to `perDay` available slots per open day, spread across the day (first of the
 * morning, first after lunch, last of the afternoon). Every slot returned exists in `slotGrid` for the same prospect,
 * so the deep link `/book/:id?slot=` always lands on a real slot.
 */
export function previewSlots(grid: SlotGrid, perDay = 3): { day: SlotDay; slots: Slot[] }[] {
  return grid.days.map((day) => {
    const free = day.slots.filter((s) => s.available);
    if (!free.length) return { day, slots: [] };
    const picks: Slot[] = [];
    const morning = free.find((s) => s.hour < LUNCH_HOUR); const afternoon = free.find((s) => s.hour >= 13); const last = free[free.length - 1];
    for (const s of [morning, afternoon, last]) if (s && !picks.includes(s) && picks.length < perDay) picks.push(s);
    for (const s of free) { if (picks.length >= perDay) break; if (!picks.includes(s)) picks.push(s); }
    return { day, slots: picks.sort((a, b) => a.iso.localeCompare(b.iso)) };
  });
}

/** "Thursday, September 24 at 10:15 AM CT" / "jueves, 24 de septiembre a las 10:15 CT". */
export function slotInWords(iso: string, tz: Tz, lang: 'en' | 'es'): string {
  const at = new Date(iso);
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const date = new Intl.DateTimeFormat(locale, { timeZone: tz.id, weekday: 'long', month: 'long', day: 'numeric' }).format(at);
  const time = new Intl.DateTimeFormat(locale, { timeZone: tz.id, hour: 'numeric', minute: '2-digit' }).format(at);
  return lang === 'es' ? `${date} a las ${time} ${tz.abbr}` : `${date} at ${time} ${tz.abbr}`;
}
export const dayLabel = (d: SlotDay, tz: Tz, lang: 'en' | 'es') => new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { timeZone: tz.id, weekday: 'short', day: 'numeric', month: 'short' }).format(zonedInstant(tz.id, d.year, d.month, d.day, 12, 0));
export const timeLabel = (s: Slot, tz: Tz, lang: 'en' | 'es') => new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { timeZone: tz.id, hour: 'numeric', minute: '2-digit' }).format(new Date(s.iso));
