-- Baptism (child) request/inquiry form — the Home page's "Book Baptism"
-- quick feature used to link to a dead /about#baptism anchor; this backs
-- the real request form it now points to.
--
-- Deliberately a SEPARATE table from baptism_records: tech spec §4.6
-- mandates baptism_records stay a permanent, staff-only sacramental
-- register with no public insert path and no direct edits (amendment-only,
-- see 0001_init.sql/0002_rls.sql). This table is a lightweight public
-- inquiry inbox instead — a parent submits a request, staff follow up
-- (phone/email, arranging a date with the priest), and once the baptism
-- actually takes place staff create the official baptism_records entry by
-- hand from /admin/baptism-records, same as today. Fields mirror
-- mass_bookings' public-intake shape rather than baptism_records'
-- permanent-record shape: no officiating_priest/godparents here, since
-- those are settled during the staff follow-up conversation, not known by
-- the parent at inquiry time.
create table public.baptism_inquiries (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  email text not null,
  phone text,
  child_name text not null,
  child_date_of_birth date,
  preferred_date date,
  message text,
  status text not null default 'pending' check (status in ('pending', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.baptism_inquiries enable row level security;

-- Same access shape as mass_bookings (0002_rls.sql): anyone can insert via
-- the public form; only church_staff/super_admin can read or update
-- (content_manager has no access — this is family/child data, not
-- "content"). No delete policy — matches the rest of the schema's
-- no-hard-delete stance. Update policy carries WITH CHECK (mass_bookings'
-- equivalent policy predates this and only has USING) so a staff-only
-- update can't be exploited to write a row that would fail re-evaluation
-- against the same role check.
create policy "baptism_inquiries_public_insert" on public.baptism_inquiries for insert with check (true);
create policy "baptism_inquiries_staff_select" on public.baptism_inquiries for select using (
  public.current_user_role() in ('super_admin','church_staff')
);
create policy "baptism_inquiries_staff_update" on public.baptism_inquiries for update using (
  public.current_user_role() in ('super_admin','church_staff')
) with check (
  public.current_user_role() in ('super_admin','church_staff')
);
