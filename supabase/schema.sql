-- Lead Magnet - Postgres schema draft (Supabase later, T44)
-- GENERATED from src/data/schema/*.ts by scripts/gen-sql.mjs. Edit the TS, regenerate, review, then apply as a migration.
-- Conventions: every table has id, created_at, updated_at.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- pages · Assets: Image / video prompts per prospect and their generation status. Provider not wired yet (T40).
create table if not exists public.assets (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id uuid not null references public.prospects(id) on delete set null,
  kind text not null check (kind in ('hero', 'device_phone', 'device_laptop', 'device_tv', 'role_card', 'og_image', 'video_frames')),
  prompt text not null,
  status text not null check (status in ('queued', 'generated', 'approved', 'rejected')),
  url text,
  provider text
);
create index if not exists assets_prospect_id_idx on public.assets(prospect_id);
create trigger assets_touch before update on public.assets for each row execute function public.touch_updated_at();

-- pages · Bookings: Walkthrough calls requested from a landing page or the demo.
create table if not exists public.bookings (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id uuid not null references public.prospects(id) on delete set null,
  page_id uuid references public.pages(id) on delete set null,
  slot timestamptz not null,
  duration_min integer not null,
  status text not null check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  -- Name given on B-01
  contact_name text not null,
  -- Where the call link goes
  contact_email text not null,
  contact_phone text,
  -- What the prospect wrote in the booking form
  notes text not null
);
create index if not exists bookings_prospect_id_idx on public.bookings(prospect_id);
create index if not exists bookings_page_id_idx on public.bookings(page_id);
create trigger bookings_touch before update on public.bookings for each row execute function public.touch_updated_at();

-- tracking · Events: Every tracked interaction on landing pages, demos, bookings and outreach. Written by src/tracking/track().
create table if not exists public.events (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  page_id uuid references public.pages(id) on delete set null,
  prospect_id uuid references public.prospects(id) on delete set null,
  session_id text not null,
  type text not null check (type in ('view', 'section_view', 'scroll_depth', 'cta_click', 'demo_open', 'demo_role_switch', 'booking_started', 'booking_confirmed', 'form_submit', 'exit_intent', 'outreach_open', 'outreach_click')),
  meta jsonb not null,
  ts timestamptz not null
);
create index if not exists events_page_id_idx on public.events(page_id);
create index if not exists events_prospect_id_idx on public.events(prospect_id);
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();

-- system · Feedback / annotations: Testers comment, request and report bugs on the product itself; agents triage from here and record the decision before changing anything.
create table if not exists public.feedback (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id text not null,
  user_name text not null,
  role text not null,
  page_code text not null,
  route text not null,
  kind text not null check (kind in ('comment', 'request', 'bug', 'idea', 'question', 'praise')),
  text text not null,
  element_path text,
  component text,
  viewport text,
  theme text,
  status text not null check (status in ('new', 'seen', 'waiting', 'done')),
  triage text check (triage in ('fix', 'ask', 'later', 'wontfix')),
  triage_note text,
  decision_ref text,
  owner_reply text
);
create trigger feedback_touch before update on public.feedback for each row execute function public.touch_updated_at();

-- pages · Landing pages: A composed landing page for a prospect: archetype, slug, variant (A/B), status and the PageModel snapshot the page renders.
create table if not exists public.pages (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id uuid not null references public.prospects(id) on delete set null,
  archetype text not null check (archetype in ('reveal', 'audit', 'walkthrough', 'letter')),
  slug text not null,
  variant text not null,
  status text not null check (status in ('draft', 'live', 'expired')),
  published_at timestamptz,
  expires_at timestamptz,
  -- PageModel snapshot
  model jsonb not null
);
create index if not exists pages_prospect_id_idx on public.pages(prospect_id);
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();

-- prospects · Prospects: One row per person we are building a lead magnet for: business, style, life and business roles, what we know and how confident we are.
-- access:
--   · strategist read/write
--   · analyst read
--   · prospect reads own row through the page
create table if not exists public.prospects (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  business_name text not null,
  -- Key in src/engine/catalog/industries.ts
  industry text not null,
  sub_industry text,
  city text not null,
  country text not null,
  lang text not null check (lang in ('en', 'es')),
  website text,
  team_size integer not null,
  locations integer not null,
  revenue_band text not null check (revenue_band in ('lt250k', '250k_1m', '1m_5m', '5m_plus')),
  warmth text not null check (warmth in ('cold', 'warm', 'hot')),
  source text not null check (source in ('cold_email', 'linkedin', 'referral', 'event', 'inbound')),
  -- { palette {primary, accent, bg, surface, text}, tone, font, imagery[] }
  style jsonb not null,
  -- e.g. owner, spouse/partner, kids, accountant, coach
  life_roles jsonb not null,
  -- e.g. owner, manager, front desk
  business_roles jsonb not null,
  -- Confirmed tools (names)
  known_tools jsonb not null,
  -- 0..1 how much we know
  confidence numeric(12,2) not null,
  -- Field names we have confirmed
  fields_known jsonb not null,
  notes text not null,
  logo_url text,
  photo_url text
);
create trigger prospects_touch before update on public.prospects for each row execute function public.touch_updated_at();

-- pages · Page recommendations: What adaptFromEvents() suggested for a page, recorded before it is applied (R-A03): kind, target archetype or section, the reason, the score and who decided. A-02 writes these; the funnel reads them.
-- access:
--   · strategist read/write
--   · analyst read
create table if not exists public.recommendations (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id uuid not null references public.prospects(id) on delete set null,
  page_id uuid not null references public.pages(id) on delete set null,
  kind text not null check (kind in ('switch_archetype', 'add_section', 'shorten', 'ask')),
  to_archetype text check (to_archetype in ('reveal', 'audit', 'walkthrough', 'letter')),
  -- Section kind for add_section
  section text,
  reason text not null,
  -- Engine score, higher first
  score numeric(12,2) not null,
  status text not null check (status in ('proposed', 'applied', 'dismissed')),
  -- Demo user id or role that decided
  decided_by text not null,
  decided_at timestamptz,
  note text not null
);
create index if not exists recommendations_prospect_id_idx on public.recommendations(prospect_id);
create index if not exists recommendations_page_id_idx on public.recommendations(page_id);
create trigger recommendations_touch before update on public.recommendations for each row execute function public.touch_updated_at();

-- prospects · Stack guesses: Software we think the prospect pays for, with monthly cost, confidence and what replaces it in their OS. Confirmed / rejected by the audit archetype and intake.
create table if not exists public.stack_guesses (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id uuid not null references public.prospects(id) on delete set null,
  tool text not null,
  category text not null,
  -- USD / month
  monthly_cost numeric(12,2) not null,
  confidence numeric(12,2) not null,
  status text not null check (status in ('guessed', 'confirmed', 'rejected')),
  -- Our module name
  replaced_by text not null
);
create index if not exists stack_guesses_prospect_id_idx on public.stack_guesses(prospect_id);
create trigger stack_guesses_touch before update on public.stack_guesses for each row execute function public.touch_updated_at();

-- plan · Plan tasks: The development plan: tasks bound by dependencies (not calendar days), each naming its model. Rendered by the K- module.
create table if not exists public.tasks (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  module text not null,
  -- Page codes
  codes jsonb not null,
  model text not null check (model in ('Fable 5.1', 'Opus 5', 'Sonnet 5', 'Justin')),
  phase integer not null,
  -- Task ids
  depends_on jsonb not null,
  status text not null check (status in ('backlog', 'doing', 'done', 'blocked', 'awaiting_justin')),
  owner text not null,
  notes text not null,
  done_at timestamptz
);
create trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();

-- outreach · Outreach touches: Cold / warm outreach messages that point at a page; opens and clicks feed the funnel.
create table if not exists public.touches (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id uuid not null references public.prospects(id) on delete set null,
  channel text not null check (channel in ('cold_email', 'linkedin_dm', 'whatsapp', 'sms', 'call', 'warm_intro')),
  subject text not null,
  body_preview text not null,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  page_id uuid references public.pages(id) on delete set null,
  status text not null check (status in ('draft', 'scheduled', 'sent', 'opened', 'clicked', 'replied', 'bounced'))
);
create index if not exists touches_prospect_id_idx on public.touches(prospect_id);
create index if not exists touches_page_id_idx on public.touches(page_id);
create trigger touches_touch before update on public.touches for each row execute function public.touch_updated_at();

-- Access intent per role (RLS later):
--   super_admin        everything
--   strategist         prospects, stack_guesses, pages, assets, touches, bookings read/write; events read
--   analyst            read events, pages, prospects, bookings, touches
--   prospect           read own page / prospect through the public slug; insert events, bookings, feedback
--   guest              insert events, bookings
