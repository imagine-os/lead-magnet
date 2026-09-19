import { defineSpec, type PageSpec } from '../../specs/types';
import { STAFF_ROLES } from '../../auth/roles';

const A = STAFF_ROLES;
const W = [360, 390, 768, 1280, 1920, 2560, 3840];

export const funnelSpec: PageSpec = defineSpec({
  code: 'A-01', name: 'Funnel overview', purpose: 'The whole funnel on one screen: outreach_open -> view -> demo_open -> booking_started -> booking_confirmed counted as distinct sessions over a 7 / 30 / 90-day range, the same five stages broken down by archetype and warmth, the A/B readout for a slug running a split, and the last twelve things that happened.',
  layout: ['filters (archetype, warmth, date range)', 'KPI row', 'funnel chart + table view', 'by archetype', 'by warmth', 'A/B readout (slug select, two sides, paired chart, comparison table, verdict)', 'recent activity'],
  data: ['events', 'pages', 'prospects', 'bookings', 'recommendations'], roles: A,
  logic: [
    'a stage counts DISTINCT session_id, so one chatty session is one viewer (R-A01)',
    'archetype joins through pages.page_id; warmth joins through prospects.prospect_id; the A/B side is the pages row the event points at, falling back to meta.variant',
    'the date range (7 / 30 / 90 / all) filters every number on the page, including the A/B readout',
    'an A/B is exactly two live pages rows on one slug (D-061); the readout deliberately ignores the archetype and warmth filters, because variant B is usually a different archetype',
    'both sides are drawn on ONE shared scale (PairedBarChart) - two self-normalised funnels would be the classic A/B misread',
    'no side is called ahead below 30 view sessions per variant and a 10 % relative lift on view -> demo_open (R-A04); below that the card says how far off the sample is',
    'when B is ahead, recording writes a `recommendations` row (kind promote_variant, status proposed) and nothing else; promoting is a Placeholder (R-A03 / D-044)',
    'variants are never pooled across slugs; conversion labels return an em dash instead of dividing by zero',
  ],
  integrations: [], components: ['Stat', 'FunnelChart', 'PairedBarChart', 'DataTable', 'SegmentedControl', 'Select', 'Field', 'Chip', 'Card', 'Badge', 'EmptyState', 'Placeholder', 'Button', 'Icon'],
  actions: [
    { id: 'admin.filterFunnel', label: 'Filter', intent: 'filter the funnel by {archetype}, {warmth} and the last {range} days', params: { archetype: 'enum:all|reveal|audit|walkthrough|letter', warmth: 'enum:all|cold|warm|hot', range: 'enum:7|30|90|all' }, permission: 'events.read' },
    { id: 'admin.compareVariants', label: 'Compare variants', intent: 'compare the A/B variants on {slug}', params: { slug: 'string' }, permission: 'events.read' },
    { id: 'admin.recordAbWinner', label: 'Record the A/B recommendation', intent: 'record the recommendation to promote the winning variant', permission: 'prospects.write' },
    { id: 'admin.openProspect', label: 'Open prospect', intent: 'open the timeline for {prospect}', params: { prospect: 'id' }, permission: 'prospects.read' },
    { id: 'admin.openStudio', label: 'Open the studio', intent: 'open the studio', permission: 'pages.publish' },
  ],
  rules: ['R-A01', 'R-A02', 'R-A03', 'R-A04', 'R-C06'], states: ['loading', 'default', 'empty', 'filtered', 'no live A/B', 'A/B below the sample', 'A/B too close', 'A/B leader', 'recommendation on file'], checkedAt: W, tone: 'home',
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
  code: 'A-03', name: 'Events log', purpose: 'The raw tracking table, filterable by type, page, A/B variant, session and prospect, with the full meta JSON of any row one click away. This is where you check that a page really tracked what it claims.',
  layout: ['filters (type, page, variant, session, prospect)', 'events DataTable', 'meta drawer (JSON)'],
  data: ['events', 'pages', 'prospects'], roles: A,
  logic: ['newest first by ts', 'filters are AND-combined; an empty filter means all', 'session ids are read from the rows themselves, so a new visitor appears in the list without a schema change', 'the variant column and filter resolve through events.page_id -> pages.variant, falling back to the meta.variant the landing page stamps (nothing invented)'],
  integrations: [], components: ['DataTable', 'Drawer', 'Select', 'Field', 'Badge', 'Button', 'Card', 'Icon'],
  actions: [
    { id: 'admin.filterEvents', label: 'Filter', intent: 'show {type} events for {prospect} on variant {variant}', params: { type: 'string', page: 'id', session: 'string', prospect: 'id', variant: 'enum:A|B' }, permission: 'events.read' },
    { id: 'admin.clearEventFilters', label: 'Clear filters', intent: 'clear the event filters', permission: 'events.read' },
    { id: 'admin.openEventMeta', label: 'JSON', intent: 'show the meta for event {id}', params: { id: 'id' }, permission: 'events.read' },
  ],
  rules: ['R-A01', 'R-A02', 'R-C06'], states: ['loading', 'default', 'filtered', 'variant filtered', 'empty', 'drawer open'], checkedAt: W, tone: 'list',
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
