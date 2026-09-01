-- Church Website — initial schema
-- Source: church_website_technical_spec.md §3 (Data Model)

-- ============================================================
-- Roles & profiles
-- ============================================================
create type public.user_role as enum ('super_admin', 'church_staff', 'content_manager');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'content_manager',
  created_at timestamptz not null default now()
);

-- Helper used by RLS policies below: the calling user's role, or null if unauthenticated.
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- Mass schedule (PRD §5.2 / tech spec §4.3)
-- ============================================================
create table public.mass_schedule (
  id uuid primary key default gen_random_uuid(),
  day_type text not null check (day_type in ('sunday', 'weekday', 'special')),
  time time not null,
  label text,
  special_date date,
  special_name text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Parish history (PRD §5.3)
-- ============================================================
create table public.parish_history (
  id uuid primary key default gen_random_uuid(),
  content text not null default '',
  founding_date date,
  founding_priest text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Organizations (PRD §5.4)
-- ============================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  mission text,
  meeting_schedule text,
  leadership_contacts text,
  how_to_join text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Mass bookings (PRD §5.5)
-- ============================================================
create table public.mass_bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  intention_type text not null,
  preferred_date date not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Baptism records (PRD §5.6) — permanent, amendment-only (tech spec §4.6/§7)
-- ============================================================
create table public.baptism_records (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  parents_names text not null,
  date_of_birth date,
  baptism_date date not null,
  officiating_priest text,
  godparents text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.baptism_record_amendments (
  id uuid primary key default gen_random_uuid(),
  baptism_record_id uuid not null references public.baptism_records(id) on delete restrict,
  amendment_text text not null,
  amended_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Homilies (PRD §5.7)
-- ============================================================
create table public.homilies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  priest_name text,
  bible_reference text,
  audio_url text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Events (PRD §5.8)
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  location text,
  created_at timestamptz not null default now()
);

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Projects (PRD §5.9)
-- ============================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  budget_details text,
  progress_update text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Harvest & Thanksgiving pledges (PRD §5.10)
-- ============================================================
create table public.harvest_pledges (
  id uuid primary key default gen_random_uuid(),
  pledger_name text not null,
  category text not null check (category in ('family', 'group', 'society')),
  pledge_details text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Announcements (homepage banner — PRD §5.1)
-- ============================================================
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  active_from timestamptz not null default now(),
  active_to timestamptz,
  created_at timestamptz not null default now()
);
