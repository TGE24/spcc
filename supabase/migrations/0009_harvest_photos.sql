-- Photos for the Home page's "Annual Harvest Celebration" section — the two
-- images shown side-by-side under the copy/CTA. Managed from
-- /admin/harvest-photos and uploaded straight to Supabase Storage (see
-- 0007_storage.sql, src/lib/storage.ts), same pattern as hero_slides
-- (0005_hero_slides.sql).
--
-- Deliberately a small reorderable list rather than exactly two fixed
-- slots: the Home page only ever renders the first two (by sort_order),
-- but staff can keep a couple of extra photos queued and reorder instead
-- of always having to delete-then-upload to swap one out.
create table public.harvest_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.harvest_photos enable row level security;

create policy "harvest_photos_public_read" on public.harvest_photos for select using (true);
create policy "harvest_photos_staff_write" on public.harvest_photos for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));
