import { defineSpec, type ActionDef, type PageSpec } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';

const WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];
const openDemo: ActionDef = { id: 'landing.openDemo', label: 'Open your demo', intent: 'open {business} demo', permission: 'demo.open' };
const bookCall: ActionDef = { id: 'landing.bookCall', label: 'Book a 15-min walkthrough', intent: 'book a walkthrough call', permission: 'booking.create' };
const saveWorkspace: ActionDef = { id: 'landing.saveWorkspace', label: 'Save your workspace', intent: 'save my workspace with my email' };
const setLang: ActionDef = { id: 'landing.setLang', label: 'EN / ES', intent: 'switch language to {lang}', params: { lang: 'enum:en|es' } };
const viewRole: ActionDef = { id: 'landing.viewRole', label: 'See a role view', intent: 'show me the {role} view', params: { role: 'string' } };
const pickSlot: ActionDef = { id: 'landing.pickSlot', label: 'Pick a slot', intent: 'book {slot}', params: { slot: 'date' }, permission: 'booking.create' };
const seeCase: ActionDef = { id: 'landing.seeCaseStudy', label: 'See the case study', intent: 'show me a case study' };
const toggleFaq: ActionDef = { id: 'landing.toggleFaq', label: 'Open a question', intent: 'answer {question}', params: { question: 'string' } };
const goToStep: ActionDef = { id: 'landing.goToStep', label: 'Next / previous scene', intent: 'go to step {step} of the story', params: { step: 'number' } };
const confirmTool: ActionDef = { id: 'landing.confirmTool', label: 'Yes, we pay for this', intent: 'confirm we use {tool}', params: { tool: 'string' } };
const rejectTool: ActionDef = { id: 'landing.rejectTool', label: 'No, not us', intent: 'reject {tool}', params: { tool: 'string' } };
const playLetter: ActionDef = { id: 'landing.playLetter', label: 'Play the voice note', intent: 'play the voice note' };
const tryAsRole: ActionDef = { id: 'landing.tryAsRole', label: 'Try it as this role', intent: 'open the demo as the {role}', params: { role: 'string' }, permission: 'demo.open' };

const COMMON = {
  roles: EVERYONE,
  data: ['pages', 'prospects', 'stack_guesses', 'events'],
  integrations: ['generated frame sequences from the live demo (`npm run frames`, public/frames/<prospectId>/) and the social card (`npm run og`, public/og/<slug>.jpg) are real; image generation (T40), booking provider (T50) and Supabase (T44) are not wired'],
  states: ['loading', 'live', 'expired -> L-05', 'reduced motion', 'phone sticky CTA', 'exit intent shown', 'variant A', 'variant B', 'frames present', 'frames missing (MiniOs fallback)'],
  checkedAt: WIDTHS,
  tone: 'landing' as const,
};
const MECHANICS = [
  'pages row looked up by :slug; status live and expires_at in the future, otherwise L-05 renders in place (never a 404)',
  'renders the pages.model snapshot in order; the archetype in the URL wins, recomposing with composePage(prospect, archetype, { pageId, slug, guesses }) only when the snapshot was composed for another archetype',
  'prospectStyle(palette, font) on the page root; every section reads --lp-*',
  'tracking: view on mount, section_view once per section, scroll_depth at 25/50/75/100, cta_click with cta + section, demo_open, booking_started, exit_intent, form_submit',
  'sticky CTA bar on phone once the hero has scrolled past; exit intent once per session (pointer leaves the top, or back / 45 s idle on touch)',
  'save your workspace asks for name + email only after a demo open or a long press on the sticky CTA (R-C01)',
  'A/B: every live pages row for the slug is a candidate; the visitor bucket is hash(sessionId + slug) % candidates, stable for the session, and ?variant=A|B forces one (studio preview)',
  '/p/:slug renders the archetype the chosen row was published with (so variant B can test a different archetype); /audit, /story and /letter force theirs over the snapshot',
  'every event carries { variant, page_id, archetype, slug } in its meta, so A-01 can compare variants without joining the pages table',
  'usePageMeta sets document.title, meta[name=description] and og:* per prospect and language; og:image points at public/og/<slug>.jpg (L-06)',
];

export const revealSpec: PageSpec = defineSpec({
  ...COMMON, code: 'L-01', name: 'Reveal landing',
  purpose: 'The default archetype: "We already built <Business>\'s operating system" - their OS revealed on phone, laptop and the back-office TV, the stack it replaces crossed out, a view for every role, proof, FAQ, the CTA band and the calendar inline.',
  layout: ['top bar (wordmark, EN/ES, primary CTA)', 'hero_reveal (3 devices, scroll-driven)', 'savings_stack (struck-through prices, count-up)', 'role_views (snap carousel / grid)', 'proof', 'faq', 'cta_band (honest urgency)', 'booking_inline (7-day grid)', 'sticky CTA (phone)', 'exit intent modal', 'save workspace modal'],
  logic: [...MECHANICS, 'hero devices scrub a real frame sequence captured from the live demo: useFrames(prospectId) loads public/frames/<id>/index.json and preloads it, useScrollFrames(count) maps the hero section to a frame (phone = NN.jpg, laptop = desk-NN.jpg), and when the index is missing the devices render the live <MiniOs> composition instead', 'reduced motion pins the first frame and never animates; the TV always holds the live composition'],
  components: ['DeviceMockup', 'Stat', 'Button', 'IconButton', 'Card', 'Badge', 'Modal', 'Field', 'Input', 'LangToggle', 'Placeholder', 'Toast', 'Avatar'],
  actions: [openDemo, bookCall, saveWorkspace, setLang, viewRole, tryAsRole, toggleFaq, seeCase, pickSlot],
  rules: ['R-C01', 'R-C02', 'R-C03', 'R-C04', 'R-C05', 'R-C06', 'R-L01', 'R-L02', 'R-L03', 'R-L04', 'R-L05'],
});

export const auditSpec: PageSpec = defineSpec({
  ...COMMON, code: 'L-02', name: 'Savings audit landing',
  purpose: 'Leads with money: the tool stack we think they pay for, pre-checked, corrected with one tap per line, and a savings counter that moves as they answer. A number they can correct beats a number they must believe.',
  layout: ['top bar', 'hero (money headline)', 'stack_audit (Yes / No per tool, live counter)', 'savings_stack', 'role_views', 'proof', 'cta_band', 'booking_inline', 'sticky CTA (phone)', 'exit intent modal'],
  logic: [...MECHANICS, 'each answer writes stack_guesses.status by id through the provider and a form_submit event; savings() recomputes from the live rows, never from the snapshot'],
  components: ['Stat', 'Button', 'Badge', 'Card', 'DeviceMockup', 'Modal', 'LangToggle', 'Placeholder'],
  actions: [confirmTool, rejectTool, openDemo, bookCall, saveWorkspace, setLang, viewRole, tryAsRole, seeCase, pickSlot],
  rules: ['R-C01', 'R-C02', 'R-C03', 'R-C04', 'R-C05', 'R-C06', 'R-L01', 'R-L02', 'R-L03', 'R-L04', 'R-L05', 'R-L06'],
});

export const walkthroughSpec: PageSpec = defineSpec({
  ...COMMON, code: 'L-03', name: 'Walkthrough landing',
  purpose: 'A pinned day-in-the-life story: 7:10 to 21:00 at their business, one scene per role, the device screen changing as you scroll - and prev / next buttons so the story is never scroll-only.',
  layout: ['top bar', 'hero (story headline)', 'walkthrough_steps (pinned device, progress rail, prev / next)', 'role_views', 'savings_stack', 'cta_band ("Make it next Tuesday")', 'booking_inline', 'sticky CTA (phone)'],
  logic: [...MECHANICS, 'an IntersectionObserver band at the middle of the viewport sets the active step; prev / next set the same state and scroll to it, so keyboard, remote and reduced motion all work', 'the pinned laptop plays the desktop frame sequence (public/frames/<id>/desk-NN.jpg) mapped from the active step, falling back to the live <MiniOs> composition when no sequence was generated'],
  components: ['DeviceMockup', 'Card', 'Button', 'Stat', 'Modal', 'LangToggle'],
  actions: [goToStep, openDemo, bookCall, saveWorkspace, setLang, viewRole, tryAsRole, pickSlot],
  rules: ['R-C01', 'R-C02', 'R-C04', 'R-C05', 'R-C06', 'R-L01', 'R-L02', 'R-L03', 'R-L04', 'R-L05'],
});

export const letterSpec: PageSpec = defineSpec({
  ...COMMON, code: 'L-04', name: 'Letter landing',
  purpose: 'For hot and referred prospects: a short personal note over their own app, one primary CTA, the calendar underneath. The voice note is a Placeholder until it is really recorded.',
  layout: ['top bar', 'letter (greeting, 3 paragraphs, signoff, sender)', 'hero_reveal (their app behind it)', 'cta_band', 'booking_inline', 'sticky CTA (phone)'],
  logic: [...MECHANICS, 'no fabricated audio: the voice note is a Placeholder (P-09) until the content pass records one'],
  components: ['Avatar', 'DeviceMockup', 'Button', 'Placeholder', 'Modal', 'LangToggle'],
  actions: [openDemo, bookCall, saveWorkspace, setLang, playLetter, pickSlot],
  rules: ['R-C01', 'R-C02', 'R-C04', 'R-C05', 'R-C06', 'R-L01', 'R-L02', 'R-L04', 'R-L05'],
});

export const expiredSpec: PageSpec = defineSpec({
  ...COMMON, code: 'L-05', name: 'Expired / unknown workspace',
  data: ['pages', 'prospects', 'feedback', 'events'],
  purpose: 'Shown for an expired page or a slug we do not know, in place of the page and never as a 404: what happened in plain words, a request for a fresh workspace (a real feedback row the studio triages) and the calendar when we still know whose link it was.',
  layout: ['top bar', 'honest message', 'request form (email + note)', 'book a call', 'link to our site'],
  logic: ['isExpired(page) = status expired or expires_at in the past', 'request inserts feedback { kind: request, page_code: L-05, status: new } and a form_submit event', 'keeps the prospect palette when the page is merely expired'],
  components: ['Card', 'Field', 'Input', 'Textarea', 'Button', 'Placeholder', 'LangToggle', 'Toast'],
  actions: [{ id: 'landing.requestRefresh', label: 'Request a fresh workspace', intent: 'request a new workspace' }, bookCall, setLang],
  rules: ['R-C05', 'R-L05'],
  states: ['expired page', 'unknown slug', 'request sent'],
});

export const ogSpec: PageSpec = defineSpec({
  ...COMMON, code: 'L-06', name: 'Social card (OG image source)',
  data: ['pages', 'prospects'],
  purpose: 'The 1200x630 link preview for one prospect\'s page, rendered as a real themed page rather than drawn by hand: the business, the headline from their own PageModel, their palette and their OS on three devices. `npm run og` screenshots the card to public/og/<slug>.jpg and the landing page points og:image at it. Hidden from navigation; a human who opens the URL gets the card plus a link to the page.',
  layout: ['og-card 1200x630 (scaled down to fit narrow viewports, never a horizontal scrollbar)', 'caption + "Open the page" below the card, outside the capture'],
  logic: [
    'reads the pages row by slug and its prospect; prospectStyle(palette, font) themes the card through --lp-*',
    'headline comes from the published pages.model hero section, so the card and the page never disagree',
    'the card is exactly 1200x630 px; .og-fit scales it by min(1, 100vw / 1240) so it fits a phone without overflow, and scripts/og.mjs captures the element at scale 1',
    'unknown slug renders a neutral Imagine card instead of an error (same spirit as R-C05)',
  ],
  components: ['DeviceMockup', 'Badge', 'Button'],
  actions: [{ id: 'landing.openPage', label: 'Open the page', intent: 'open the landing page this card previews' }],
  rules: ['R-L04', 'R-L05'],
  states: ['known slug', 'unknown slug', 'scaled to fit'],
});
