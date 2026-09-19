import type { RouteDef } from '../specs/types';
import type { LeadMagnetControl } from '../actions/webmcp';
import { isStubElement } from './registry';
/** What scripts/*.mjs, Playwright and WebMCP tooling read from the running app. */
export interface RouteManifestEntry { path: string; code: string; surface: RouteDef['surface']; status: 'built' | 'stub'; roles: string[]; spec: RouteDef['spec'] }
/** `window.__leadmagnet`: routes + version here; `tools`, `vocabulary`, `runAction`, `webmcp` from src/actions/webmcp.ts (control.md). */
export type LeadMagnetGlobal = { routes: RouteManifestEntry[]; version: string } & Partial<LeadMagnetControl>;
export function buildManifest(routes: RouteDef[]): RouteManifestEntry[] { return routes.map((r) => ({ path: r.path, code: r.spec.code, surface: r.surface, status: isStubElement(r.element) ? 'stub' : 'built', roles: r.roles, spec: r.spec })); }
/** Merges into the existing global so the tools published by the control bridge survive a re-render. */
export function publishManifest(routes: RouteDef[]): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { __leadmagnet?: LeadMagnetGlobal };
  w.__leadmagnet = Object.assign(w.__leadmagnet ?? {}, { routes: buildManifest(routes), version: __APP_VERSION__ }) as LeadMagnetGlobal;
}
