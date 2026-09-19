import { defineSpec, type PageSpec } from '../../specs/types';
import type { Role } from '../../auth/roles';

/** Studio is the strategist's workbench: prospects -> intake -> compose -> assets -> outreach. */
export const STUDIO_ROLES: Role[] = ['super_admin', 'strategist'];
const base = { roles: STUDIO_ROLES, integrations: [] as string[], checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840] };

export const specs = {
  list: defineSpec({
    ...base, code: 'S-01', name: 'Prospects list', tone: 'list',
    purpose: 'Every prospect with warmth, confidence, the live page (archetype, status, expiry), the last tracked event and the booking state; filter by warmth, industry and whether a page is live; create a prospect and go straight into intake.',
    layout: ['page head + New prospect', 'KPI row', 'filters (warmth chips, industry select, live-page toggle)', 'DataTable (cards under 768)', 'new prospect Modal'],
    data: ['prospects (read/write)', 'pages (read)', 'events (read)', 'bookings (read)', 'stack_guesses (write on create)'],
    logic: [
      'live page per prospect = the row with status live, else the most recently published',
      'last event = max(ts) over events for that prospect',
      'booking = the latest bookings row by slot',
      'create: insert prospects with the industry catalog roles + the default palette, confidence = computeConfidence(fields_known), then insert guessStack() rows, then navigate to S-02',
    ],
    components: ['DataTable', 'Chip', 'Select', 'Toggle', 'Button', 'Badge', 'ProgressBar', 'Stat', 'Modal', 'Field', 'Input', 'Card', 'EmptyState'],
    actions: [
      { id: 'studio.newProspect', label: 'New prospect', intent: 'create a prospect', permission: 'prospects.write' },
      { id: 'studio.createProspect', label: 'Create prospect', intent: 'create {business} in {industry}', params: { business: 'string', industry: 'string' }, permission: 'prospects.write' },
      { id: 'studio.filterProspects', label: 'Filter', intent: 'show {warmth} prospects in {industry}', params: { warmth: 'string', industry: 'string', live: 'string' } },
      { id: 'studio.openProspect', label: 'Open', intent: 'open prospect {name}', params: { name: 'string' } },
    ],
    rules: ['R-S03', 'R-E01', 'R-E03'], states: ['loading', 'default', 'filtered', 'empty', 'modal open'],
  }),
  profile: defineSpec({
    ...base, code: 'S-02', name: 'Prospect profile + AI intake', tone: 'form',
    purpose: 'Everything we know about one prospect and the adaptive intake that closes the gaps: nextQuestions() as real fields, applyAnswer() on save, confidence and the recommended archetype recomputing live, stack guesses to confirm or reject with the savings total, role and style editors with a themed mini preview.',
    layout: ['prospect nav', 'header (palette swatches, tone, warmth, language)', 'confidence meter + recommendation', 'what we know / still unknown', 'adaptive intake questions', 'stack guesses + savings', 'roles editor', 'style editor + mini preview', 'enrichment'],
    data: ['prospects (read/write)', 'stack_guesses (read/write)', 'pages (read)'],
    logic: [
      'nextQuestions(p, 4) drives the form; each field renders the control its type deserves (select for enums, number for counts, comma list for arrays)',
      'save = applyAnswer(p, field, value) then update("prospects", id, { field, fields_known, confidence }) - R-S03',
      'confidence = computeConfidence(fields_known) (R-E03); the recommendation is pickArchetype(p)[0] and re-ranks on every answer',
      'confirm / reject writes stack_guesses.status by id; savings(p, guesses) ignores rejected rows',
      'the mini preview uses prospectStyle(palette, font) -> --lp-* custom properties, never forked tokens',
      'defaultEnricher (rules) fills obvious gaps; the LLM enricher is not wired (T43)',
    ],
    components: ['ProgressBar', 'Field', 'Input', 'Select', 'Chip', 'Card', 'Badge', 'Button', 'Stat', 'DataTable', 'Textarea', 'Placeholder', 'Avatar', 'EmptyState'],
    actions: [
      { id: 'studio.answerQuestion', label: 'Save answer', intent: 'answer {field} with {value}', params: { field: 'string', value: 'string' }, permission: 'prospects.write' },
      { id: 'studio.confirmTool', label: 'Confirm tool', intent: 'confirm {tool}', params: { tool: 'string' }, permission: 'prospects.write' },
      { id: 'studio.rejectTool', label: 'Reject tool', intent: 'reject {tool}', params: { tool: 'string' }, permission: 'prospects.write' },
      { id: 'studio.addRole', label: 'Add role', intent: 'add the {role} {kind} role', params: { role: 'string', kind: 'enum:business|life' }, permission: 'prospects.write' },
      { id: 'studio.removeRole', label: 'Remove role', intent: 'remove the {role} {kind} role', params: { role: 'string', kind: 'enum:business|life' }, permission: 'prospects.write' },
      { id: 'studio.setStyle', label: 'Set style', intent: 'set {key} to {value}', params: { key: 'string', value: 'string' }, permission: 'prospects.write' },
      { id: 'studio.saveNotes', label: 'Save notes', intent: 'save the research notes', permission: 'prospects.write' },
      { id: 'studio.fillGaps', label: 'Fill obvious gaps', intent: 'fill the obvious gaps with the rule enricher', permission: 'prospects.write' },
      { id: 'studio.runEnricher', label: 'Enrich with AI', intent: 'enrich this prospect', permission: 'prospects.write' },
      { id: 'studio.openCompose', label: 'Compose the page', intent: 'compose the page', permission: 'pages.publish' },
    ],
    rules: ['R-S03', 'R-E01', 'R-E03'], states: ['loading', 'default', 'fully known', 'not found'],
  }),
  compose: defineSpec({
    ...base, code: 'S-03', name: 'Page composer', tone: 'form',
    purpose: 'Rank the four archetypes with their reasons, pick one, preview the real landing route at 390 and 1280, set the A/B variant and publish a 14-day page (or expire it).',
    layout: ['prospect nav', 'live page status', 'archetype ranking cards with score bars', 'segmented picker', 'variant + slug', 'previews (390 / 1280)', 'publish / expire'],
    data: ['prospects (read)', 'stack_guesses (read)', 'pages (read/write)'],
    logic: [
      'pickArchetype(p) gives score + reasons; the top score sets the card order',
      'the preview iframes the real public route for the archetype (/p/:slug, /p/:slug/audit, /p/:slug/story, /p/:slug/letter)',
      'publish writes pages: status live, published_at now, expires_at +14 days (R-S02), model = composePage() snapshot, slug from the existing row or slugify(business)',
      'publish is blocked under 0.3 confidence unless the override is on (R-S01)',
      'expire sets status expired and leaves the snapshot in place',
    ],
    components: ['ViewportFrame', 'SegmentedControl', 'Card', 'Button', 'Badge', 'ProgressBar', 'Field', 'Input', 'Toggle', 'Stat', 'Chip'],
    actions: [
      { id: 'studio.pickArchetype', label: 'Use this archetype', intent: 'use the {archetype} archetype', params: { archetype: 'enum:reveal|audit|walkthrough|letter' }, permission: 'pages.publish' },
      { id: 'studio.setVariant', label: 'Variant', intent: 'set the variant to {variant}', params: { variant: 'string' }, permission: 'pages.publish' },
      { id: 'studio.overrideConfidence', label: 'Override the gate', intent: 'publish anyway under 30 % confidence', permission: 'pages.publish' },
      { id: 'studio.publishPage', label: 'Publish', intent: 'publish the page', permission: 'pages.publish' },
      { id: 'studio.expirePage', label: 'Expire', intent: 'expire the page', permission: 'pages.publish' },
      { id: 'studio.copyPageLink', label: 'Copy link', intent: 'copy the public link' },
    ],
    rules: ['R-S01', 'R-S02', 'R-S03', 'R-C05', 'R-E02'], states: ['loading', 'no page yet', 'draft', 'live', 'expired', 'blocked by confidence'],
  }),
  assets: defineSpec({
    ...base, code: 'S-04', name: 'Assets & image prompts', tone: 'list',
    purpose: 'Every image and video prompt the page needs, grouped by kind, editable before generation; approve or reject each one. The image provider is not wired yet (T40).',
    layout: ['prospect nav', 'status counts', 'groups by kind', 'prompt cards (editable Textarea, aspect, notes)', 'generate (Placeholder) / approve / reject'],
    data: ['assets (read/write)', 'prospects (read)'],
    logic: ['imagePrompts(p) is the source of truth; on first visit the missing rows are inserted as queued', 'editing a prompt updates assets.prompt by id on blur', 'approve / reject set assets.status by id'],
    components: ['Card', 'Textarea', 'Badge', 'Button', 'Placeholder', 'Stat', 'Chip', 'EmptyState'],
    actions: [
      { id: 'studio.generateAsset', label: 'Generate', intent: 'generate the {kind} image', params: { kind: 'string' } },
      { id: 'studio.savePrompt', label: 'Save prompt', intent: 'save the prompt for {asset}', params: { asset: 'id' }, permission: 'prospects.write' },
      { id: 'studio.approveAsset', label: 'Approve', intent: 'approve {asset}', params: { asset: 'id' }, permission: 'prospects.write' },
      { id: 'studio.rejectAsset', label: 'Reject', intent: 'reject {asset}', params: { asset: 'id' }, permission: 'prospects.write' },
    ],
    rules: ['R-S03', 'R-P02'], states: ['loading', 'queued', 'approved', 'rejected', 'empty'],
  }),
  outreach: defineSpec({
    ...base, code: 'S-05', name: 'Outreach composer', tone: 'form',
    purpose: 'Write the message that points at the page: two or three templates per channel in English and Spanish, tokens filled from the profile and the savings, drafted into touches. Sending is not wired; "mark as sent" keeps the demo funnel honest.',
    layout: ['prospect nav', 'channel select', 'template cards', 'subject + body editor', 'filled preview', 'draft / send (Placeholder) / mark as sent', 'touches history table'],
    data: ['touches (read/write)', 'prospects (read)', 'pages (read)', 'stack_guesses (read)'],
    logic: [
      'tokens {first_name} {business} {savings_annual} {tools_cut} {page_url} {city} {industry} are filled from the prospect, savings() and the live page slug',
      'the template language follows the prospect (prospects.lang), overridable with the EN / ES picker',
      'Draft inserts a touches row with status draft and the page id; Mark as sent sets sent_at + status sent by id (R-S03)',
    ],
    components: ['Select', 'SegmentedControl', 'Textarea', 'Input', 'Field', 'Card', 'DataTable', 'Badge', 'Button', 'Placeholder', 'EmptyState'],
    actions: [
      { id: 'studio.pickChannel', label: 'Channel', intent: 'write a {channel} message', params: { channel: 'enum:cold_email|linkedin_dm|whatsapp|sms|call|warm_intro' } },
      { id: 'studio.pickTemplate', label: 'Template', intent: 'use the {template} template', params: { template: 'string' } },
      { id: 'studio.draftTouch', label: 'Draft', intent: 'draft a {channel} message', params: { channel: 'string' }, permission: 'prospects.write' },
      { id: 'studio.sendTouch', label: 'Send', intent: 'send the message' },
      { id: 'studio.markTouchSent', label: 'Mark as sent', intent: 'mark {touch} as sent', params: { touch: 'id' }, permission: 'prospects.write' },
    ],
    rules: ['R-S03', 'R-C06'], states: ['loading', 'default', 'drafted', 'sent', 'no page yet'],
  }),
} satisfies Record<string, PageSpec>;
