import { defineSpec } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';

/** R-01: the client proposal. Every number comes from the engine (R-R01) and the page prints as a document (R-R02). */
export const proposalSpec = defineSpec({
  code: 'R-01', name: 'Client proposal view',
  purpose: 'The whole offer for one prospect on one page, themed to them and printable: what they get (their OS surfaces), what they save (their guessed stack vs our price band), who gets a view (every business and life role), how it runs (phases bound by dependencies), the price, and the next step (book the walkthrough, accept, print).',
  layout: ['cover (business, prepared for, date, Imagine wordmark)', 'what you get (7 OS surfaces + phone / laptop / TV composition)', 'savings (stack table, tools cut, annual saving vs our band)', 'roles (every business + life role and what they see)', 'timeline (intake -> compose -> demo -> walkthrough -> build passes -> go-live, dependency-bound)', 'price (band, what is included)', 'next steps (book a call, accept (Placeholder), print)'],
  data: ['prospects', 'stack_guesses', 'pages', 'events'], roles: EVERYONE,
  logic: [
    'prospect from :prospectId; stack guesses read from stack_guesses, falling back to guessStack(prospect) when none are stored',
    'savings(prospect, guesses) supplies monthly_current, annual_current, tools_cut, our_price_monthly, price_band, net_annual - no number is typed into the page (R-R01)',
    'deriveRoleViews(prospect) supplies one row per business and life role with the first widgets they see',
    'themed with prospectStyle(prospect.style.palette, prospect.style.font) on the page root (--lp-*), never by forking tokens',
    'print stylesheet hides chrome, breaks pages between sections and forces black text on white (R-R02)',
    'view + section_view + cta_click tracked with prospect_id and the live page_id',
  ],
  integrations: ['e-sign for Accept proposal (not wired, later pass)', 'booking B-01 for the walkthrough'],
  components: ['Card', 'Stat', 'DataTable', 'DeviceMockup', 'Badge', 'Button', 'Placeholder', 'LangToggle', 'EmptyState'],
  actions: [
    { id: 'proposal.accept', label: 'Accept proposal', intent: 'accept the proposal' },
    { id: 'proposal.print', label: 'Print', intent: 'print the proposal', permission: 'proposal.read' },
    { id: 'proposal.bookCall', label: 'Book the walkthrough', intent: 'book the walkthrough call', permission: 'booking.create' },
    { id: 'proposal.openDemo', label: 'Open their OS demo', intent: 'open the live demo', permission: 'demo.open' },
  ],
  rules: ['R-R01', 'R-R02', 'R-C06'], states: ['default', 'unknown prospect', 'print'],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840], tone: 'landing',
});
