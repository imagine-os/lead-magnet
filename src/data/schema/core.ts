import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const int = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'int', nullable, description });
const num = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'numeric', nullable, description });
const json = (name: string, description?: string, nullable = false): ColumnDef => ({ name, type: 'json', description, wide: true, nullable });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });
const ts = (name: string, nullable = false): ColumnDef => ({ name, type: 'timestamptz', nullable });

export const LANGS = ['en', 'es'] as const;
export const REVENUE_BANDS = ['lt250k', '250k_1m', '1m_5m', '5m_plus'] as const;
export const WARMTH = ['cold', 'warm', 'hot'] as const;
export const SOURCES = ['cold_email', 'linkedin', 'referral', 'event', 'inbound'] as const;
export const TONES = ['bold', 'warm', 'clean', 'luxury', 'playful'] as const;
export const FONTS = ['display', 'humanist', 'serif', 'mono'] as const;
export const GUESS_STATUS = ['guessed', 'confirmed', 'rejected'] as const;
export const ARCHETYPES = ['reveal', 'audit', 'walkthrough', 'letter'] as const;
export const PAGE_STATUS = ['draft', 'live', 'expired'] as const;
export const EVENT_TYPES = ['view', 'section_view', 'scroll_depth', 'cta_click', 'demo_open', 'demo_role_switch', 'booking_started', 'booking_confirmed', 'form_submit', 'exit_intent', 'outreach_open', 'outreach_click'] as const;
export const BOOKING_STATUS = ['requested', 'confirmed', 'cancelled', 'completed'] as const;
export const ASSET_KINDS = ['hero', 'device_phone', 'device_laptop', 'device_tv', 'role_card', 'og_image', 'video_frames'] as const;
export const ASSET_STATUS = ['queued', 'generated', 'approved', 'rejected'] as const;
export const CHANNELS = ['cold_email', 'linkedin_dm', 'whatsapp', 'sms', 'call', 'warm_intro'] as const;
export const TOUCH_STATUS = ['draft', 'scheduled', 'sent', 'opened', 'clicked', 'replied', 'bounced'] as const;
export const MODELS = ['Fable 5.1', 'Opus 5', 'Sonnet 5', 'Justin'] as const;
export const TASK_STATUS = ['backlog', 'doing', 'done', 'blocked', 'awaiting_justin'] as const;
export const FEEDBACK_KINDS = ['comment', 'request', 'bug', 'idea', 'question', 'praise'] as const;
export const FEEDBACK_STATUS = ['new', 'seen', 'waiting', 'done'] as const;
export const TRIAGE = ['fix', 'ask', 'later', 'wontfix'] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type Warmth = (typeof WARMTH)[number];
export type RevenueBand = (typeof REVENUE_BANDS)[number];
export type Archetype = (typeof ARCHETYPES)[number];
export type TaskStatus = (typeof TASK_STATUS)[number];
export type ModelName = (typeof MODELS)[number];

export interface ProspectStyle { palette: { primary: string; accent: string; bg: string; surface: string; text: string }; tone: (typeof TONES)[number]; font: (typeof FONTS)[number]; imagery: string[] }
export interface ProspectRow extends BaseRow {
  first_name: string; last_name: string; business_name: string; industry: string; sub_industry: string | null; city: string; country: string; lang: 'en' | 'es'; website: string | null;
  team_size: number; locations: number; revenue_band: RevenueBand; warmth: Warmth; source: (typeof SOURCES)[number]; style: ProspectStyle;
  life_roles: string[]; business_roles: string[]; known_tools: string[]; confidence: number; fields_known: string[]; notes: string; logo_url: string | null; photo_url: string | null;
}
export interface StackGuessRow extends BaseRow { prospect_id: string; tool: string; category: string; monthly_cost: number; confidence: number; status: (typeof GUESS_STATUS)[number]; replaced_by: string }
export interface PageRow extends BaseRow { prospect_id: string; archetype: Archetype; slug: string; variant: string; status: (typeof PAGE_STATUS)[number]; published_at: string | null; expires_at: string | null; model: unknown }
export interface EventRow extends BaseRow { page_id: string | null; prospect_id: string | null; session_id: string; type: EventType; meta: Record<string, unknown>; ts: string }
export interface BookingRow extends BaseRow { prospect_id: string; page_id: string | null; slot: string; duration_min: number; status: (typeof BOOKING_STATUS)[number]; notes: string }
export interface AssetRow extends BaseRow { prospect_id: string; kind: (typeof ASSET_KINDS)[number]; prompt: string; status: (typeof ASSET_STATUS)[number]; url: string | null; provider: string | null }
export interface TouchRow extends BaseRow { prospect_id: string; channel: (typeof CHANNELS)[number]; subject: string; body_preview: string; sent_at: string | null; opened_at: string | null; clicked_at: string | null; page_id: string | null; status: (typeof TOUCH_STATUS)[number] }
export interface TaskRow extends BaseRow { title: string; module: string; codes: string[]; model: ModelName; phase: number; depends_on: string[]; status: TaskStatus; owner: string; notes: string; done_at: string | null }
export interface FeedbackRow extends BaseRow { user_id: string; user_name: string; role: string; page_code: string; route: string; kind: (typeof FEEDBACK_KINDS)[number]; text: string; element_path: string | null; component: string | null; viewport: string | null; theme: string | null; status: (typeof FEEDBACK_STATUS)[number]; triage: (typeof TRIAGE)[number] | null; triage_note: string | null; decision_ref: string | null; owner_reply: string | null }

export const tables = defineTables([
  { name: 'prospects', label: 'Prospects', description: 'One row per person we are building a lead magnet for: business, style, life and business roles, what we know and how confident we are.', group: 'prospects', titleColumn: 'business_name', source: 'prompt 0001', access: ['strategist read/write', 'analyst read', 'prospect reads own row through the page'],
    columns: [text('first_name'), text('last_name'), text('business_name'), text('industry', false, 'Key in src/engine/catalog/industries.ts'), text('sub_industry', true), text('city'), text('country'), en('lang', LANGS), text('website', true), int('team_size'), int('locations'), en('revenue_band', REVENUE_BANDS), en('warmth', WARMTH), en('source', SOURCES),
      json('style', '{ palette {primary, accent, bg, surface, text}, tone, font, imagery[] }'), json('life_roles', 'e.g. owner, spouse/partner, kids, accountant, coach'), json('business_roles', 'e.g. owner, manager, front desk'), json('known_tools', 'Confirmed tools (names)'), num('confidence', false, '0..1 how much we know'), json('fields_known', 'Field names we have confirmed'), text('notes'), text('logo_url', true), text('photo_url', true)] },
  { name: 'stack_guesses', label: 'Stack guesses', description: 'Software we think the prospect pays for, with monthly cost, confidence and what replaces it in their OS. Confirmed / rejected by the audit archetype and intake.', group: 'prospects', titleColumn: 'tool', source: 'engine guessStack()',
    columns: [ref('prospect_id', 'prospects'), text('tool'), text('category'), { name: 'monthly_cost', type: 'money', description: 'USD / month' }, num('confidence'), en('status', GUESS_STATUS), text('replaced_by', false, 'Our module name')] },
  { name: 'pages', label: 'Landing pages', description: 'A composed landing page for a prospect: archetype, slug, variant (A/B), status and the PageModel snapshot the page renders.', group: 'pages', titleColumn: 'slug', source: 'engine composePage()',
    columns: [ref('prospect_id', 'prospects'), en('archetype', ARCHETYPES), text('slug'), text('variant'), en('status', PAGE_STATUS), ts('published_at', true), ts('expires_at', true), json('model', 'PageModel snapshot')] },
  { name: 'events', label: 'Events', description: 'Every tracked interaction on landing pages, demos, bookings and outreach. Written by src/tracking/track().', group: 'tracking', source: 'playbook principle 9',
    columns: [ref('page_id', 'pages', true), ref('prospect_id', 'prospects', true), text('session_id'), en('type', EVENT_TYPES), json('meta'), ts('ts')] },
  { name: 'bookings', label: 'Bookings', description: 'Walkthrough calls requested from a landing page or the demo.', group: 'pages', source: 'B-01',
    columns: [ref('prospect_id', 'prospects'), ref('page_id', 'pages', true), ts('slot'), int('duration_min'), en('status', BOOKING_STATUS), text('notes')] },
  { name: 'assets', label: 'Assets', description: 'Image / video prompts per prospect and their generation status. Provider not wired yet (T40).', group: 'pages', titleColumn: 'kind', source: 'engine imagePrompts()',
    columns: [ref('prospect_id', 'prospects'), en('kind', ASSET_KINDS), text('prompt'), en('status', ASSET_STATUS), text('url', true), text('provider', true)] },
  { name: 'touches', label: 'Outreach touches', description: 'Cold / warm outreach messages that point at a page; opens and clicks feed the funnel.', group: 'outreach', titleColumn: 'subject', source: 'S-05, A-04',
    columns: [ref('prospect_id', 'prospects'), en('channel', CHANNELS), text('subject'), text('body_preview'), ts('sent_at', true), ts('opened_at', true), ts('clicked_at', true), ref('page_id', 'pages', true), en('status', TOUCH_STATUS)] },
  { name: 'tasks', label: 'Plan tasks', description: 'The development plan: tasks bound by dependencies (not calendar days), each naming its model. Rendered by the K- module.', group: 'plan', titleColumn: 'title', source: 'docs/build-plan.md',
    columns: [text('title'), text('module'), json('codes', 'Page codes'), en('model', MODELS), int('phase'), json('depends_on', 'Task ids'), en('status', TASK_STATUS), text('owner'), text('notes'), ts('done_at', true)] },
  { name: 'feedback', label: 'Feedback / annotations', description: 'Testers comment, request and report bugs on the product itself; agents triage from here and record the decision before changing anything.', group: 'system', source: 'P-08',
    columns: [text('user_id'), text('user_name'), text('role'), text('page_code'), text('route'), en('kind', FEEDBACK_KINDS), text('text'), text('element_path', true), text('component', true), text('viewport', true), text('theme', true), en('status', FEEDBACK_STATUS), en('triage', TRIAGE, true), text('triage_note', true), text('decision_ref', true), text('owner_reply', true)] },
]);
