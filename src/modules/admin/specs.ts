import { defineSpec, type PageSpec } from '../../specs/types';
import { STAFF_ROLES } from '../../auth/roles';

const A = STAFF_ROLES;
const W = [360, 390, 768, 1280, 1920, 2560, 3840];

export const funnelSpec: PageSpec = defineSpec({
  code: 'A-01', name: 'Funnel overview', purpose: 'The whole funnel on one screen: outreach_open -> view -> demo_open -> booking_started -> booking_confirmed counted as distinct sessions, the same five stages broken down by archetype, warmth and A/B variant, and the last twelve things that happened.',
  layout: ['filters (archetype, warmth)', 'KPI row', 'funnel chart + table view', 'by archetype', 'by warmth', 'A/B by variant', 'recent activity'],
  data: ['events', 'pages', 'prospects', 'bookings'], roles: A,
  logic: ['a stage counts DISTINCT session_id, so one chatty session is one viewer (R-A01)', 'archetype and variant join through pages.page_id; warmth joins through prospects.prospect_id', 'A/B is only compared when two or more variants have live pages and events (R-A02)', 'conversion labels return an em dash instead of dividing by zero'],
  integrations: [], components: ['Stat', 'FunnelChart', 'DataTable', 'Chip', 'Card', 'Badge', 'EmptyState', 'Button', 'Icon'],
  actions: [
    { id: 'admin.filterFunnel', label: 'Filter', intent: 'filter the funnel by {archetype} and {warmth}', params: { archetype: 'enum:all|reveal|audit|walkthrough|letter', warmth: 'enum:all|cold|warm|hot' }, permission: 'events.read' },
    { id: 'admin.openProspect', label: 'Open prospect', intent: 'open the timeline for {prospect}', params: { prospect: 'id' }, permission: 'prospects.read' },
    { id: 'admin.openStudio', label: 'Open the studio', intent: 'open the studio', permission: 'pages.publish' },
  ],
  rules: ['R-A01', 'R-A02', 'R-C06'], states: ['loading', 'default', 'empty', 'filtered', 'A/B blocked'], checkedAt: W, tone: 'home',
});

export const timelineSpec: PageSpec = defineSpec({
  code: 'A-02', name: 'Prospect timeline', purpose: 'Everything one prospect has done - every outreach touch, every tracked event, every booking - merged into one ordered list, with the engine\'s current recommendations recorded before any of them is applied.',
  layout: ['header (prospect, warmth, page archetype / variant)', 'confidence + shortcuts', 'recommendations', 'merged timeline (touches + events + bookings)'],
  data: ['prospects', 'pages', 'events', 'touches', 'bookings', 'stack_guesses', 'recommendations'], roles: A,
  logic: ['adaptFromEvents(page, events, prospect) is re-derived on every render; nothing is cached', 'a recommendation is written to `recommendations` as proposed before a page changes, then flipped to applied / dismissed with decided_at and decided_by (R-A03)', 'applying an archetype switch recomposes pages.model with composePage() and writes archetype + model by id', 'add_section / shorten / ask are Placeholders until the landing and studio modules can act on them'],
  integrations: [], components: ['Card', 'Badge', 'Avatar', 'ProgressBar', 'Button', 'Placeholder', 'EmptyState', 'Icon'],
  actions: [
    { id: 'admin.applyRecommendation', label: 'Apply', intent: 'apply recommendation {n}', params: { n: 'number' }, permission: 'pages.publish' },
    { id: 'admin.recordRecommendation', label: 'Record', intent: 'record recommendation {n}', params: { n: 'number', note: 'string' }, permission: 'prospects.write' },
    { id: 'admin.dismissRecommendation', label: 'Dismiss', intent: 'dismiss recommendation {n}', params: { n: 'number' }, permission: 'prospects.write' },
    { id: 'admin.openFor', label: 'Open', intent: 'open the {surface} for this prospect', params: { surface: 'enum:studio|demo|page|booking' }, permission: 'prospects.read' },
  ],
  rules: ['R-A01', 'R-A03', 'R-E02'], states: ['loading', 'default', 'no page', 'no recommendations', 'empty timeline'], checkedAt: W,
});

export const eventsSpec: PageSpec = defineSpec({
  code: 'A-03', name: 'Events log', purpose: 'The raw tracking table, filterable by type, page, session and prospect, with the full meta JSON of any row one click away. This is where you check that a page really tracked what it claims.',
  layout: ['filters (type, page, session, prospect)', 'events DataTable', 'meta drawer (JSON)'],
  data: ['events', 'pages', 'prospects'], roles: A,
  logic: ['newest first by ts', 'filters are AND-combined; an empty filter means all', 'session ids are read from the rows themselves, so a new visitor appears in the list without a schema change'],
  integrations: [], components: ['DataTable', 'Drawer', 'Select', 'Field', 'Badge', 'Button', 'Card', 'Icon'],
  actions: [
    { id: 'admin.filterEvents', label: 'Filter', intent: 'show {type} events for {prospect}', params: { type: 'string', page: 'id', session: 'string', prospect: 'id' }, permission: 'events.read' },
    { id: 'admin.clearEventFilters', label: 'Clear filters', intent: 'clear the event filters', permission: 'events.read' },
    { id: 'admin.openEventMeta', label: 'JSON', intent: 'show the meta for event {id}', params: { id: 'id' }, permission: 'events.read' },
  ],
  rules: ['R-A01', 'R-C06'], states: ['loading', 'default', 'filtered', 'empty', 'drawer open'], checkedAt: W, tone: 'list',
});

export const outreachSpec: PageSpec = defineSpec({
  code: 'A-04', name: 'Outreach board', purpose: 'Every touch as a card in a status column - draft, sent, opened, clicked, replied - with its channel, its page and its timestamps. Moving a card is a Select, so it works on a keyboard, a phone and a remote.',
  layout: ['channel filter', 'status columns with touch cards', 'move Select per card'],
  data: ['touches', 'prospects', 'pages'], roles: A,
  logic: ['scheduled and bounced land in an "other" column so no touch can disappear from the board', 'moving a touch forward stamps sent_at / opened_at / clicked_at when they are missing and never clears an earlier stamp', 'writes go through the provider by id (P-14); the board re-renders from the change event'],
  integrations: ['Sending is not wired: S-05 drafts, a provider sends (T41)'],
  components: ['Card', 'Select', 'Field', 'Badge', 'Icon', 'EmptyState'],
  actions: [
    { id: 'admin.moveTouch', label: 'Move', intent: 'mark {touch} as {status}', params: { touch: 'id', status: 'enum:draft|scheduled|sent|opened|clicked|replied|bounced' }, permission: 'prospects.write' },
    { id: 'admin.filterOutreach', label: 'Filter channel', intent: 'show only {channel} outreach', params: { channel: 'string' }, permission: 'events.read' },
  ],
  rules: ['R-A01'], states: ['loading', 'default', 'filtered', 'empty', 'read-only role'], checkedAt: W,
});

export const bookingsSpec: PageSpec = defineSpec({
  code: 'A-05', name: 'Bookings', purpose: 'Upcoming and past walkthrough calls with the slot in the prospect\'s own timezone, who asked, what they wrote, and a status Select that writes the row by id.',
  layout: ['counts', 'upcoming table', 'past table'],
  data: ['bookings', 'prospects'], roles: A,
  logic: ['upcoming = slot in the future and not cancelled; everything else is past', 'the slot is rendered in the prospect\'s timezone (guessed from their city) and the current language', 'status writes by id through the provider (R-B03)'],
  integrations: ['Booking provider (Cal.com / Calendly) - not wired, T42'],
  components: ['DataTable', 'Select', 'Stat', 'Badge', 'Card'],
  actions: [{ id: 'admin.setBookingStatus', label: 'Set status', intent: 'mark booking {id} {status}', params: { id: 'id', status: 'enum:requested|confirmed|cancelled|completed' }, permission: 'prospects.write' }],
  rules: ['R-B02', 'R-B03'], states: ['loading', 'default', 'no upcoming', 'read-only role'], checkedAt: W, tone: 'list',
});
