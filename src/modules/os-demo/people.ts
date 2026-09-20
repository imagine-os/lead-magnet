/** Deterministic fictional people for the demo: the prospect is themselves, every other role gets a stable name. */
import type { Industry, Prospect } from '../../engine/types';

const FIRST = ['Ana', 'Marcus', 'Lucía', 'Devin', 'Priya', 'Tomás', 'Nora', 'Elias', 'Camila', 'Jordan', 'Sofía', 'Reggie', 'Mira', 'Héctor', 'Beatriz', 'Owen'];
const LAST = ['Reyes', 'Hale', 'Moreno', 'Park', 'Nakamura', 'Vargas', 'Delgado', 'Okafor', 'Serrano', 'Blake', 'Quintero', 'Ibarra'];

/** Small stable string hash (FNV-1a-ish) so the same role always gets the same person. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
export const pick = <T,>(list: readonly T[], seed: string, offset = 0): T => list[(hash(seed) + offset) % list.length];

export interface Person { id: string; name: string; role: string; color: string }

export const isOwnerRole = (role: string) => /^owner\b|owner$|managing partner|broker owner/i.test(role);
export const roleSlug = (role: string) => role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/**
 * URL slug of a role VIEW, unique across business + life: `owner` is both the business owner and the owner's own life
 * view, so the life one becomes `life-owner` when it collides. Business views keep the bare role slug.
 */
export const viewSlug = (v: { role: string; kind: string }, views: readonly { role: string; kind: string }[]) => {
  const s = roleSlug(v.role);
  return v.kind === 'life' && views.some((x) => x.kind === 'business' && roleSlug(x.role) === s) ? `life-${s}` : s;
};
/** The view for a URL slug (exact view slug first, then the bare role slug, business first). */
export const findView = <V extends { role: string; kind: string }>(views: readonly V[], slug: string): V | null =>
  views.find((v) => viewSlug(v, views) === slug) ?? views.find((v) => roleSlug(v.role) === slug) ?? null;
/** React key for a role view: kind + role, unique where the role name alone is not. */
export const viewKey = (v: { role: string; kind: string }) => `${v.kind}:${v.role}`;
export const titleCase = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** The person who holds a role in this prospect's world. `owner` is the prospect. */
export function personFor(p: Prospect, role: string, offset = 0): Person {
  const seed = `${p.id}|${role}|${offset}`;
  const own = isOwnerRole(role) && offset === 0;
  const name = own ? `${p.first_name} ${p.last_name}` : `${pick(FIRST, seed)} ${pick(LAST, seed, 7)}`;
  const palette = [p.style.palette.primary, p.style.palette.accent, p.style.palette.text];
  return { id: `${roleSlug(role)}-${offset}`, name, role, color: palette[hash(seed) % palette.length] };
}
/**
 * The roles this business actually has: the prospect's own list when they gave one, otherwise the resolved industry's
 * (`industryFor(p)`, so a dog hotel staffs handlers and groomers and a tenant-law firm paralegals, not a generic list).
 */
export const bizRoles = (p: Prospect, ind: Industry): string[] => (p.business_roles?.length ? p.business_roles : ind.business_roles);

/** n people for a department column, seeded by the department label. */
export function peopleFor(p: Prospect, dept: string, roles: string[], n: number): Person[] {
  const out: Person[] = [];
  for (let i = 0; i < n; i++) { const role = roles[(hash(dept) + i) % Math.max(1, roles.length)] ?? 'staff'; out.push(personFor(p, role, hash(`${dept}${i}`) % 5)); }
  return out;
}
