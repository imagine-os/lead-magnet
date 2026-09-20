import type { Prospect, RoleView, Widget, Bi, MeterSample } from './types';
import { industryFor } from './catalog/industries';

const bi = (en: string, es: string): Bi => ({ en, es });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Roles that read the whole business, so they get the trend chart and, when the industry names a capacity resource, the meter. */
const LEADS = /owner|partner|director|manager/;

/**
 * One RoleView per business role and life role, 3 sample widgets each, themed to the industry ("every role of the people in their life gets their own view").
 * Reads `industryFor(p)`, so a sub-industry's KPIs, pains and roles show (T55). When the industry (or its sub) declares a `meter` hint, the lead roles' KPI tile becomes a `meter` widget - occupancy is a gauge, not a number (reference-systems.md §3.3).
 */
export function deriveRoleViews(p: Prospect): RoleView[] {
  const ind = industryFor(p);
  const biz = (p.business_roles?.length ? p.business_roles : ind.business_roles).slice(0, 6);
  const life = (p.life_roles?.length ? p.life_roles : ind.life_roles).slice(0, 5);
  const k = ind.kpis;
  const views: RoleView[] = [];
  for (const role of biz) {
    const w: Widget[] = [
      { id: `${role}-kpi`, title: k[0]?.label ?? bi('Today', 'Hoy'), kind: 'kpi', sample: k[0]?.sample ?? '—' },
      { id: `${role}-cal`, title: bi(`${cap(role)} schedule`, `Agenda de ${role}`), kind: 'calendar', sample: ['9:00', '10:30', '13:00', '15:30'] },
      { id: `${role}-list`, title: bi('Needs attention', 'Requiere atención'), kind: 'list', sample: ind.pains.slice(0, 3).map((x) => x.en) },
    ];
    if (LEADS.test(role) && ind.meter) { const m = ind.meter; const sample: MeterSample = { value: m.value, max: m.max, unit: m.unit, hint: bi(`${m.value} of ${m.max}${m.unit ? ` ${m.unit.en}` : ''}`, `${m.value} de ${m.max}${m.unit ? ` ${m.unit.es}` : ''}`) }; w[0] = { id: `${role}-meter`, title: m.label, kind: 'meter', sample }; }
    if (LEADS.test(role)) w[2] = { id: `${role}-chart`, title: bi('This month vs last', 'Este mes vs anterior'), kind: 'chart', sample: [42, 48, 51, 47, 58, 63, 71] };
    if (/front|host|desk|intake|advisor|coordinator/.test(role)) w[2] = { id: `${role}-chat`, title: bi('Unified inbox', 'Bandeja unificada'), kind: 'chat', sample: [{ from: 'SMS', text: 'Running 10 min late!' }, { from: 'WhatsApp', text: 'Can I add Saturday?' }, { from: 'Email', text: 'Invoice question' }] };
    views.push({ role, kind: 'business', headline: bi(`${cap(role)}: ${p.business_name} at a glance`, `${cap(role)}: ${p.business_name} de un vistazo`), widgets: w });
  }
  for (const role of life) {
    let w: Widget[];
    if (/spouse|partner/.test(role)) w = [{ id: `${role}-cal`, title: bi('Family calendar', 'Calendario familiar'), kind: 'calendar', sample: ['Soccer 17:00', 'Dinner 19:30'] }, { id: `${role}-kpi`, title: bi('Home budget left', 'Presupuesto del hogar'), kind: 'kpi', sample: '$1,240' }, { id: `${role}-list`, title: bi('Shared lists', 'Listas compartidas'), kind: 'list', sample: ['Groceries', 'Weekend trip', 'House projects'] }];
    else if (/kid|child|teen/.test(role)) w = [{ id: `${role}-cal`, title: bi('My week', 'Mi semana'), kind: 'calendar', sample: ['School', 'Practice', 'Game day'] }, { id: `${role}-list`, title: bi('Chores & allowance', 'Tareas y mesada'), kind: 'list', sample: ['Feed the dog', 'Homework', 'Trash'] }, { id: `${role}-chat`, title: bi('Family chat', 'Chat familiar'), kind: 'chat', sample: [{ from: 'Mom', text: 'Pick up at 4' }] }];
    else if (/account|book|cpa|tax/.test(role)) w = [{ id: `${role}-table`, title: bi('Month close', 'Cierre del mes'), kind: 'table', sample: [['Revenue', '$84,120'], ['Payroll', '$31,900'], ['Software', '$0']] }, { id: `${role}-doc`, title: bi('Tax docs', 'Documentos fiscales'), kind: 'doc', sample: ['Q3 estimate', '1099s', 'Sales tax'] }, { id: `${role}-kpi`, title: bi('Cash on hand', 'Efectivo'), kind: 'kpi', sample: '$118,400' }];
    else if (/coach|consult|vet|lender|educator|supplier|director|counsel|investor|nutrition/.test(role)) w = [{ id: `${role}-doc`, title: bi('Shared workspace', 'Espacio compartido'), kind: 'doc', sample: ['Quarterly review', 'Notes'] }, { id: `${role}-chart`, title: bi('Progress', 'Progreso'), kind: 'chart', sample: [3, 5, 4, 7, 8, 9] }, { id: `${role}-chat`, title: bi('Direct line', 'Línea directa'), kind: 'chat', sample: [{ from: cap(role), text: 'Sent the review, see you Tuesday' }] }];
    else w = [{ id: `${role}-kpi`, title: bi('Business today', 'El negocio hoy'), kind: 'kpi', sample: k[0]?.sample ?? '—' }, { id: `${role}-cal`, title: bi('Work + life', 'Trabajo + vida'), kind: 'calendar', sample: ['Open 7:00', 'Dentist 12:00', 'Kids 17:00'] }, { id: `${role}-chart`, title: bi('Savings this year', 'Ahorro este año'), kind: 'chart', sample: [0, 800, 1600, 2400, 3200] }];
    views.push({ role, kind: 'life', headline: bi(`${cap(role)}: your own view`, `${cap(role)}: tu propia vista`), widgets: w });
  }
  return views;
}
