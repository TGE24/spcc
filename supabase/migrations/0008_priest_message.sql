-- Home page "A Message from the Parish Priest" section (the green card
-- overlapping the hero) — was hardcoded copy; now admin-managed the same
-- way Parish History works (single row, upsert-by-id, content_manager+ can
-- write). Deliberately nullable/no default content unlike parish_history
-- (which falls back to placeholder copy when empty): this section is
-- meant to disappear entirely from the Home page until staff actually
-- write something, not show placeholder text — see src/app/page.tsx.
create table public.priest_message (
  id uuid primary key default gen_random_uuid(),
  heading text,
  message text,
  updated_at timestamptz not null default now()
);

alter table public.priest_message enable row level security;

create policy "priest_message_public_read" on public.priest_message for select using (true);
create policy "priest_message_staff_write" on public.priest_message for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));
