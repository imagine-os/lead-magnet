import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { specs, DEV_ROLES, DOCS_ROLES } from './specs';
import { RoutesPage } from './RoutesPage';
import { ComponentsPage } from './ComponentsPage';
import { TablesPage } from './TablesPage';
import { ActionsPage } from './ActionsPage';
import { RulesPage } from './RulesPage';
import { DocsPage } from './DocsPage';
import { CanvasPage } from './CanvasPage';
import { QaPreviewPage } from './QaPreviewPage';
import { FeedbackPage } from './FeedbackPage';
const dev = (path: string, el: () => JSX.Element, spec: RouteDef['spec'], order: number, icon: string, label: string): RouteDef => ({ path, element: h(el), spec, roles: DEV_ROLES, surface: 'dev', nav: { label, icon, order, group: 'dev' } });
export const routes: RouteDef[] = [
  dev('/dev', RoutesPage, specs.routes, 1, 'list', 'Routes'),
  dev('/dev/components', ComponentsPage, specs.components, 2, 'layers', 'Components'),
  dev('/dev/tables', TablesPage, specs.tables, 3, 'table', 'Tables'),
  { path: '/dev/tables/:table', element: h(TablesPage), spec: specs.tables, roles: DEV_ROLES, surface: 'dev' },
  dev('/dev/actions', ActionsPage, specs.actions, 4, 'target', 'Actions'),
  dev('/dev/rules', RulesPage, specs.rules, 5, 'flag', 'Rules'),
  { path: '/docs', element: h(DocsPage), spec: specs.docs, roles: DOCS_ROLES, surface: 'docs', nav: { label: 'Docs', icon: 'book', order: 1, group: 'docs' } },
  { path: '/docs/pages/:code', element: h(DocsPage), spec: specs.docs, roles: DOCS_ROLES, surface: 'docs' },
  dev('/dev/canvas', CanvasPage, specs.canvas, 7, 'map', 'Page canvas'),
  dev('/dev/qa', QaPreviewPage, specs.qa, 8, 'grid', 'QA preview'),
  dev('/dev/feedback', FeedbackPage, specs.feedback, 9, 'message', 'Feedback inbox'),
];
export const strings = {};
