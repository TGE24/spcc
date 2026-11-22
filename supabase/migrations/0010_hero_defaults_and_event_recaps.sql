-- Two small content additions, both staff-managed:
--
-- 1. hero_settings — the default Home page hero headline/subtext. Used by
--    every hero slide that doesn't set its own heading/subheading, and by
--    the placeholder hero shown before any slides exist. Single row,
--    upsert-by-id, same pattern as priest_message (0008). Empty values fall
--    back to the built-in copy in src/components/hero-slider.tsx.
--
-- 2. events.cover_image_url / events.recap — past events now get a detail
--    page (/events/[id]) with a cover photo and a write-up of how it went;
--    upcoming events don't (they RSVP straight from their card on /events).
--    cover_image_url is an uploaded Storage URL (0007) and takes precedence
--    over the older image_slot static-file mechanism (0004).

create table public.hero_settings (
  id uuid primary key default gen_random_uuid(),
  heading text,
  subheading text,
  updated_at timestamptz not null default now()
);

alter table public.hero_settings enable row level security;

create policy "hero_settings_public_read" on public.hero_settings for select using (true);
create policy "hero_settings_staff_write" on public.hero_settings for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

alter table public.events
  add column if not exists cover_image_url text,
  add column if not exists recap text;
