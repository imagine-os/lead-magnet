import type { ReactNode } from 'react';
import type { Role } from '../auth/roles';
import type { Permission } from '../auth/permissions';

export type Surface = 'public' | 'demo' | 'studio' | 'admin' | 'plan' | 'dev' | 'docs' | 'manual';
export type LayoutMode = 'mobile' | 'desktop' | 'auto';
/** L landing, C OS demo, B booking, S studio, A admin, K plan, W website, R proposal, M manual, D dev, HUB hub. */
export const CODE_RE = /^(L|C|B|S|A|K|W|R|M|D|HUB)-\d{2}[a-z]?$/;

/** One action = one button / menu item / form submit. The manifest of these is the WebMCP surface and the voice vocabulary (P-05). */
export interface ActionDef {
  /** '<module>.<verb>' e.g. 'studio.publishPage' */
  id: string;
  label: string;
  /** The phrase a person would say: 'publish {prospect}'s page' */
  intent: string;
  /** Same string the page calls via can(). */
  permission?: Permission;
  params?: Record<string, 'string' | 'number' | 'id' | 'date' | `enum:${string}`>;
}

/** The builder-tool contract. Every routed page carries one and the InspectorPanel shows it. */
export interface PageSpec {
  code: string; name: string; purpose: string;
  layout: string[]; data: string[]; roles: Role[]; logic: string[]; integrations: string[]; components: string[];
  actions: ActionDef[];
  rules?: string[]; states?: string[]; notes?: string[];
  /** Widths the page has been checked at (P-01). */
  checkedAt?: number[];
  tone?: 'home' | 'list' | 'form' | 'landing';
}
export interface NavDef { label: string; icon: string; order: number; group: string; to?: string }
export interface RouteDef { path: string; element: ReactNode; spec: PageSpec; roles: Role[]; surface: Surface; layout?: LayoutMode; nav?: NavDef }

/** Validates the code and returns the spec. Throws in dev on a bad code so a typo never ships. */
export function defineSpec(spec: PageSpec): PageSpec {
  if (!CODE_RE.test(spec.code)) { const msg = `[spec] code "${spec.code}" does not match ${CODE_RE}`; if (import.meta.env.DEV) throw new Error(msg); console.warn(msg); }
  for (const a of spec.actions) if (!/^[a-z_]+\.[a-zA-Z]+$/.test(a.id)) console.warn(`[spec] ${spec.code} action id "${a.id}" should be <module>.<verb>`);
  return spec;
}

export function specCompleteness(spec: PageSpec): { score: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ['purpose', !!spec.purpose], ['layout', spec.layout.length > 0], ['data', spec.data.length > 0], ['roles', spec.roles.length > 0],
    ['logic', spec.logic.length > 0], ['components', spec.components.length > 0], ['actions', spec.actions.length > 0],
    ['rules', !!spec.rules && spec.rules.length > 0], ['states', !!spec.states && spec.states.length > 0],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);
  return { score: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
}

export const SURFACE_LABEL: Record<Surface, string> = { public: 'Public', demo: 'OS demo', studio: 'Studio', admin: 'Admin & analytics', plan: 'Plan', dev: 'Dev tools', docs: 'Docs', manual: 'Ops manual' };
export function surfaceOfCode(code: string): string {
  const p = code.split('-')[0];
  return ({ L: 'Landing pages', C: 'OS demo', B: 'Booking', S: 'Studio', A: 'Admin & analytics', K: 'Plan', W: 'Website', R: 'Proposal', M: 'Ops manual', D: 'Dev tools', HUB: 'Hub' } as Record<string, string>)[p] ?? p;
}
