import type { RouteDef } from '../specs/types';
import { isStubElement } from './registry';
/** What scripts/screenshots.mjs and WebMCP tooling read from the running app. */
export interface RouteManifestEntry { path: string; code: string; surface: RouteDef['surface']; status: 'built' | 'stub'; roles: string[]; spec: RouteDef['spec'] }
export function buildManifest(routes: RouteDef[]): RouteManifestEntry[] { return routes.map((r) => ({ path: r.path, code: r.spec.code, surface: r.surface, status: isStubElement(r.element) ? 'stub' : 'built', roles: r.roles, spec: r.spec })); }
export function publishManifest(routes: RouteDef[]): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { __leadmagnet?: { routes: RouteManifestEntry[]; version: string } }).__leadmagnet = { routes: buildManifest(routes), version: __APP_VERSION__ };
}
