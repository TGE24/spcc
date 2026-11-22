-- Baptism requests now collect the parish's "Baptismal Particulars" (the
-- paper form parents used to bring to the office), and staff confirm a
-- request by scheduling the baptism and the practice for parents and
-- godparents.
--
-- 1. Particulars: the child's names split the way the register records
--    them (family / baptismal / other), origin, Ibadan address, place of
--    birth, both parents and both godparents. child_name and parent_name
--    stay as they are and are still filled in (composed from the new
--    fields), so existing pages and emails keep working.
--
-- 2. Schedule: baptism date/time/place and practice date/time/place, set by
--    staff from /admin/baptism-inquiries/[id]. A new 'scheduled' status sits
--    between 'contacted' and 'closed'. The practice must fall on an earlier
--    day than the baptism, and a 'scheduled' request must have both dates;
--    both are enforced here as well as in the admin form.
--
-- 3. The public insert policy is tightened: a request submitted from the
--    website can only arrive as 'pending' with no schedule, so nobody can
--    post a pre-"scheduled" request around the form.

alter table public.baptism_inquiries
  add column if not exists family_name text,
  add column if not exists baptismal_name text,
  add column if not exists other_names text,
  add column if not exists town_of_origin text,
  add column if not exists address text,
  add column if not exists place_of_birth text,
  add column if not exists father_name text,
  add column if not exists mother_name text,
  add column if not exists godfather_name text,
  add column if not exists godmother_name text,
  add column if not exists baptism_date date,
  add column if not exists baptism_time time,
  add column if not exists baptism_place text,
  add column if not exists practice_date date,
  add column if not exists practice_time time,
  add column if not exists practice_place text,
  add column if not exists scheduled_at timestamptz;

alter table public.baptism_inquiries drop constraint if exists baptism_inquiries_status_check;
alter table public.baptism_inquiries
  add constraint baptism_inquiries_status_check
  check (status in ('pending', 'contacted', 'scheduled', 'closed'));

alter table public.baptism_inquiries
  add constraint baptism_inquiries_practice_before_baptism
  check (practice_date is null or baptism_date is null or practice_date < baptism_date);

alter table public.baptism_inquiries
  add constraint baptism_inquiries_scheduled_has_dates
  check (status <> 'scheduled' or (baptism_date is not null and practice_date is not null));

drop policy if exists "baptism_inquiries_public_insert" on public.baptism_inquiries;
create policy "baptism_inquiries_public_insert" on public.baptism_inquiries for insert with check (
  status = 'pending'
  and baptism_date is null and baptism_time is null and baptism_place is null
  and practice_date is null and practice_time is null and practice_place is null
  and scheduled_at is null
);
