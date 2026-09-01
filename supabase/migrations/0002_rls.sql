-- Church Website — Row Level Security policies
-- Source: church_website_technical_spec.md §4 (role model) and §7 (baptism records)

alter table public.profiles enable row level security;
alter table public.mass_schedule enable row level security;
alter table public.parish_history enable row level security;
alter table public.organizations enable row level security;
alter table public.mass_bookings enable row level security;
alter table public.baptism_records enable row level security;
alter table public.baptism_record_amendments enable row level security;
alter table public.homilies enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_photos enable row level security;
alter table public.projects enable row level security;
alter table public.harvest_pledges enable row level security;
alter table public.announcements enable row level security;

-- ---------- profiles ----------
-- Users can read their own profile; super_admin can read/manage all.
create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid() or public.current_user_role() = 'super_admin');
create policy "profiles_super_admin_write" on public.profiles
  for all using (public.current_user_role() = 'super_admin')
  with check (public.current_user_role() = 'super_admin');

-- ---------- content tables: public read, content_manager+ write ----------
-- (mass_schedule, parish_history, organizations, homilies, events, event_photos, announcements)
create policy "mass_schedule_public_read" on public.mass_schedule for select using (true);
create policy "mass_schedule_staff_write" on public.mass_schedule for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "parish_history_public_read" on public.parish_history for select using (true);
create policy "parish_history_staff_write" on public.parish_history for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "organizations_public_read" on public.organizations for select using (true);
create policy "organizations_staff_write" on public.organizations for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "homilies_public_read" on public.homilies for select using (true);
create policy "homilies_staff_write" on public.homilies for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "events_public_read" on public.events for select using (true);
create policy "events_staff_write" on public.events for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "event_photos_public_read" on public.event_photos for select using (true);
create policy "event_photos_staff_write" on public.event_photos for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "announcements_public_read" on public.announcements for select using (true);
create policy "announcements_staff_write" on public.announcements for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

create policy "projects_public_read" on public.projects for select using (true);
create policy "projects_staff_write" on public.projects for all
  using (public.current_user_role() in ('super_admin','church_staff','content_manager'))
  with check (public.current_user_role() in ('super_admin','church_staff','content_manager'));

-- ---------- event_rsvps: anyone can insert, staff can read/manage ----------
create policy "event_rsvps_public_insert" on public.event_rsvps for insert with check (true);
create policy "event_rsvps_staff_manage" on public.event_rsvps for select using (
  public.current_user_role() in ('super_admin','church_staff','content_manager')
);

-- ---------- mass_bookings: anyone can insert, only church_staff/super_admin manage ----------
-- (content_manager has no access — bookings aren't "content")
create policy "mass_bookings_public_insert" on public.mass_bookings for insert with check (true);
create policy "mass_bookings_staff_manage" on public.mass_bookings for select using (
  public.current_user_role() in ('super_admin','church_staff')
);
create policy "mass_bookings_staff_update" on public.mass_bookings for update using (
  public.current_user_role() in ('super_admin','church_staff')
);

-- ---------- harvest_pledges: anyone can insert, only church_staff/super_admin read ----------
create policy "harvest_pledges_public_insert" on public.harvest_pledges for insert with check (true);
create policy "harvest_pledges_staff_manage" on public.harvest_pledges for select using (
  public.current_user_role() in ('super_admin','church_staff')
);

-- ---------- baptism_records: super_admin + church_staff ONLY. No public access. ----------
-- No delete policy at all — matches tech spec §7 "no hard deletes."
create policy "baptism_records_staff_select" on public.baptism_records for select using (
  public.current_user_role() in ('super_admin','church_staff')
);
create policy "baptism_records_staff_insert" on public.baptism_records for insert with check (
  public.current_user_role() in ('super_admin','church_staff')
);
-- Intentionally no update policy — corrections go through baptism_record_amendments (see below),
-- matching "no direct edits to existing entries" (tech spec §4.6).

create policy "baptism_record_amendments_staff_select" on public.baptism_record_amendments for select using (
  public.current_user_role() in ('super_admin','church_staff')
);
create policy "baptism_record_amendments_staff_insert" on public.baptism_record_amendments for insert with check (
  public.current_user_role() in ('super_admin','church_staff')
);
