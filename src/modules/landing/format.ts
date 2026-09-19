import type { Lang } from '../../i18n/types';
/** Money in the viewer's language, always whole dollars (the numbers are estimates, cents would be a lie). */
export const usd = (n: number, lang: Lang = 'en') => `$${Math.round(n).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US')}`;
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Role-view URL slugs, matching what the OS demo's router expects (`/demo/:id/role/:slug`). Kept here rather than
 * imported from the demo module so the two modules stay independent; the rule is one line and the demo owns the
 * canonical version (`src/modules/os-demo/people.ts`). `owner` exists as both a business and a life view, so the
 * life one becomes `life-owner` when it collides - exactly the demo's rule.
 */
export const roleSlug = (role: string) => role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const viewSlug = (v: { role: string; kind: string }, views: readonly { role: string; kind: string }[]) => {
  const s = roleSlug(v.role);
  return v.kind === 'life' && views.some((x) => x.kind === 'business' && roleSlug(x.role) === s) ? `life-${s}` : s;
};
