-- Hero slider for the Home page — lets staff manage the hero image(s) shown
-- at the top of / without a code change. One row behaves like the old
-- static hero (no slider controls render); two or more become an
-- auto-advancing slideshow with dots/arrows (see src/components/hero-slider.tsx).
-- heading/subheading are optional per-slide overrides of the default copy.
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  heading text,
  subheading text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

create policy "hero_slides_public_read" on public.hero_slides for select using (true);
create policy "hero_slides_staff_write" on public.hero_slides for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));
