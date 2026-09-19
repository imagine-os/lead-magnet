import { defineSpec, type ActionDef, type PageSpec } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';

/** Chrome actions live on every C- page: the shell registers them under the page's own code. */
const SHELL: ActionDef[] = [
  { id: 'demo.switchRole', label: 'Switch role', intent: 'view as {role}', permission: 'demo.open', params: { role: 'string' } },
  { id: 'demo.goto', label: 'Go to section', intent: 'open {section}', permission: 'demo.open', params: { section: 'enum:home|departments|comms|money|life|settings' } },
  { id: 'demo.saveWorkspace', label: 'Save your workspace', intent: 'save my workspace' },
  { id: 'demo.bookCall', label: 'Book a walkthrough', intent: 'book a walkthrough call', permission: 'booking.create' },
];
const CHECKED = [360, 390, 768, 1280, 1920, 2560, 3840];
const base = (code: string, name: string, purpose: string, layout: string[], data: string[], logic: string[], components: string[], actions: ActionDef[], rules: string[]): PageSpec =>
  defineSpec({ code, name, purpose, layout, data, roles: EVERYONE, logic, integrations: ['comms provider (T42, Placeholder)', 'Stripe (T51, Placeholder)', 'Supabase auth (T44, Placeholder)'], components, actions: [...SHELL, ...actions], rules, states: ['loading', 'default', 'empty (unknown prospect)'], checkedAt: CHECKED, notes: ['Built by module os-demo (T13)'] });

const HOME_ACTIONS: ActionDef[] = [
  { id: 'demo.openWidget', label: 'Open', intent: 'open {widget}', permission: 'demo.open', params: { widget: 'string' } },
  { id: 'demo.quickAction', label: 'Quick action', intent: 'run the quick action {action}', params: { action: 'string' } },
];
const HOME_LAYOUT = ['top bar (wordmark, role switcher, EN/ES, save + book)', 'sidebar / bottom nav', 'headline', 'today strip', 'quick actions', 'widgets grid (kpi, calendar week, list, chat, chart, doc, table)'];
const HOME_LOGIC = ['deriveRoleViews(prospect) gives one view per business + life role (R-D02)', 'the role lives in the URL (/role/:slug); missing role falls back to the first business role', 'demo_open once per session, demo_role_switch on change, section_view per page, cta_click + form_submit for save / book'];
const HOME_COMPONENTS = ['Card', 'Stat', 'Badge', 'Button', 'Chip', 'Avatar', 'DataTable', 'Placeholder', 'Select', 'Field', 'LangToggle', 'Modal', 'Input', 'EmptyState', 'Icon'];

export const c01 = base('C-01', 'OS demo shell', "The prospect's operating system, themed to them: role switcher for every business + life role, phone / desktop / 10-foot layouts, EN/ES, and a save / book pair that never gates the demo.", HOME_LAYOUT, ['prospects', 'pages', 'events'], HOME_LOGIC, HOME_COMPONENTS, HOME_ACTIONS, ['R-D01', 'R-D02', 'R-D03', 'R-C01', 'R-C06']);
export const c02 = base('C-02', 'Role home', "One role's view: the widgets deriveRoleViews gives that role, rendered by kind and themed to the industry, plus today and quick actions.", HOME_LAYOUT, ['prospects', 'pages', 'events'], HOME_LOGIC, HOME_COMPONENTS, HOME_ACTIONS, ['R-D01', 'R-D02', 'R-C06']);
export const c03 = base('C-03', 'Departments board', 'Their departments from the industry catalog as a board: people, open items and a KPI per column.', ['department columns', 'KPI per department', 'people', 'open items', 'open department (Placeholder)'], ['prospects', 'pages'], ['departments, pains and KPIs come from the industry catalog', 'people are deterministic fictional names seeded from the prospect id and the role'], ['Card', 'Stat', 'Badge', 'Avatar', 'Button', 'Placeholder'], [{ id: 'demo.openDepartment', label: 'Open department', intent: 'open the {department} department', permission: 'demo.open', params: { department: 'string' } }], ['R-D01', 'R-D02']);
export const c04 = base('C-04', 'Comms inbox', 'Unified inbox: calls, email, SMS and WhatsApp in one thread list with themed sample messages; the composer is an honest Placeholder.', ['channel tabs', 'thread list', 'thread pane', 'composer (Placeholder)'], ['prospects', 'pages', 'events'], ['sample threads mention the business by name in EN + ES', 'channel filter is client-side; selecting a thread never leaves the page'], ['Tabs', 'Card', 'Avatar', 'Badge', 'Textarea', 'Placeholder', 'EmptyState', 'Icon'], [
  { id: 'demo.filterChannel', label: 'Filter channel', intent: 'show {channel} only', params: { channel: 'enum:all|call|email|sms|whatsapp' } },
  { id: 'demo.openThread', label: 'Open thread', intent: 'open the thread with {thread}', params: { thread: 'id' } },
  { id: 'demo.reply', label: 'Reply', intent: 'reply to {thread}', params: { thread: 'id' } },
], ['R-D01']);
export const c05 = base('C-05', 'Money', 'Their crossed-out stack with the savings, cash today, payments and payroll (Stripe is not wired).', ['savings stats', 'crossed-out stack', 'savings curve', 'payments table', 'payroll (Placeholder)'], ['prospects', 'stack_guesses', 'pages'], ['stack_guesses rows are read live and run through savings(); rejected guesses drop out', 'cash today is the sum of the paid sample payments'], ['Stat', 'Card', 'Badge', 'DataTable', 'Placeholder'], [{ id: 'demo.openPayment', label: 'Open payment', intent: 'open payment {payment}', params: { payment: 'id' } }], ['R-D01', 'R-C03']);
export const c06 = base('C-06', 'Family / life view', 'The people in their life as views of their own: partner, kids, accountant, coach; shared calendar, shared lists, family chat.', ['life people row', 'shared calendar (week)', 'shared lists', 'family chat'], ['prospects', 'pages'], ['life roles come from deriveRoleViews(kind = life)', 'each person opens their own role home'], ['Card', 'Avatar', 'Badge', 'Button', 'Placeholder', 'EmptyState'], [{ id: 'demo.openLifeRole', label: 'Open view', intent: "open {role}'s view", permission: 'demo.open', params: { role: 'string' } }], ['R-D01', 'R-D02']);
export const c07 = base('C-07', 'Settings & roles', 'Every business and life role with a permission summary, the brand palette and font, language, invite: proof that it is theirs and configurable.', ['roles table', 'brand palette + font', 'language', 'data export (Placeholder)', 'invite (Placeholder)'], ['prospects', 'pages'], ['permission summary is derived from the role name (owner / staff / life / books) until real auth (T44)'], ['DataTable', 'Card', 'Badge', 'Avatar', 'Button', 'LangToggle', 'Placeholder'], [
  { id: 'demo.invite', label: 'Invite', intent: 'invite {person}', params: { person: 'string' } },
  { id: 'demo.openRole', label: 'Open view', intent: "open {role}'s view", permission: 'demo.open', params: { role: 'string' } },
], ['R-D01', 'R-D02']);
