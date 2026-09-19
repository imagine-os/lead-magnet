import { defineSpec } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';

const COMMON = { roles: EVERYONE, integrations: ['Stripe checkout (not wired, T51)'], states: ['default', 'dev mode'], checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840] };

/** W-01 home. Our own brand (default tokens), our own chrome: this is Imagine's website, not a prospect page. */
export const homeSpec = defineSpec({
  ...COMMON, code: 'W-01', name: 'Website home', tone: 'landing',
  purpose: "Imagine's public home for this offer: an operating system already built for you. Shows a seeded prospect's real OS on phone, laptop and TV, the three-step promise, the average saving across the systems we have built, a grid of sample pages that all open live, a pricing teaser and one CTA into the purchase flow.",
  layout: ['top nav (home, how it works, pricing, see the hub)', 'hero + device trio with a sample switcher', 'three-step promise', 'savings proof (average across seeded prospects)', 'sample pages grid', 'pricing teaser', 'CTA band', 'footer'],
  data: ['prospects', 'pages', 'stack_guesses'],
  logic: ['samples = seeded prospects that have a page row, so every sample link opens a real page (R-W02)', 'savings proof = mean of savings(prospect, guesses).net_annual over those prospects, from the engine (R-W01)', 'hero device trio iframes the sample landing page and its OS demo at the sample\'s own theme'],
  components: ['DeviceMockup', 'Card', 'Stat', 'Button', 'Badge', 'SegmentedControl', 'LangToggle', 'Icon'],
  actions: [
    { id: 'site.showSample', label: 'Show sample', intent: 'show {sample} in the hero', params: { sample: 'string' } },
    { id: 'site.seeSample', label: 'See a sample', intent: 'open a sample landing page', params: { sample: 'string' } },
    { id: 'site.openDemo', label: 'Open the demo', intent: 'open the sample OS demo', params: { sample: 'string' }, permission: 'demo.open' },
    { id: 'site.startPurchase', label: 'Get yours', intent: 'start the purchase flow' },
  ],
  rules: ['R-W01', 'R-W02'],
});

/** W-02 how it works: the adaptive loop, honestly labelled. */
export const howSpec = defineSpec({
  ...COMMON, code: 'W-02', name: 'How it works',
  purpose: 'The method in plain words: we learn who you are, guess the stack you pay for, compose your system, show you the live demo, book fifteen minutes, then adapt from what you actually did on the page. Includes the engine diagram, an FAQ and, in dev mode, an honest list of what is not wired yet.',
  layout: ['top nav', 'intro', 'six steps', 'engine diagram (inline SVG)', 'FAQ', 'what is not wired yet (dev mode)', 'CTA band', 'footer'],
  data: [],
  logic: ['steps mirror the engine: nextQuestions -> guessStack -> composePage -> demo -> booking -> adaptFromEvents', 'the not-wired list is rendered only when dev mode is on (P-09 honesty without scaring a visitor)'],
  components: ['Card', 'Button', 'Badge', 'Icon', 'LangToggle'],
  actions: [
    { id: 'site.startPurchase', label: 'Get yours', intent: 'start the purchase flow' },
    { id: 'site.seeSample', label: 'See a sample', intent: 'open a sample landing page', params: { sample: 'string' } },
  ],
  rules: ['R-W01'],
});

/** W-03 pricing + purchase flow. Bands and every number come from the engine; checkout is a Placeholder until Stripe (T51). */
export const pricingSpec = defineSpec({
  ...COMMON, code: 'W-03', name: 'Pricing + purchase flow',
  purpose: 'Three bands (starter / team / multi) priced from the engine, a savings calculator that guesses your stack from your industry and team size, and a purchase flow that stops honestly at a checkout placeholder while still recording the intent.',
  layout: ['top nav', 'bands (starter / team / multi)', 'savings calculator (industry, team size, locations)', 'checkout (Placeholder, records form_submit)', 'FAQ line', 'footer'],
  data: ['events'],
  logic: ['prices from PRICE_MONTHLY / priceBand in src/engine/stack.ts, never typed into the page (R-W01)', 'calculator builds a synthetic prospect and runs guessStack + savings, so the visitor sees the same maths a real prospect sees', 'Choose plan records a form_submit event with the band and reveals the checkout card', 'checkout button is a Placeholder (will: Stripe checkout; by: T51)'],
  components: ['Card', 'Stat', 'Select', 'Input', 'Field', 'Button', 'Badge', 'Placeholder', 'DataTable', 'LangToggle'],
  actions: [
    { id: 'site.choosePlan', label: 'Choose plan', intent: 'choose the {band} plan', params: { band: 'enum:starter|team|multi' } },
    { id: 'site.calcSavings', label: 'Estimate my saving', intent: 'estimate the saving for a {industry} with {team} people', params: { industry: 'string', team: 'number', locations: 'number' } },
    { id: 'site.checkout', label: 'Checkout', intent: 'pay for the plan' },
  ],
  rules: ['R-W01'],
});
