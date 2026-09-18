import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { PageStub } from '../../components/template/PageStub/PageStub';
import { STUBS } from './specs';
export const routes: RouteDef[] = STUBS.map((s) => ({ path: s.path, element: h(PageStub, { spec: s.spec }), spec: s.spec, roles: s.roles, surface: s.surface, nav: s.nav }));
export const strings = {};
