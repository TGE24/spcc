# Setup Guide

This walks through everything needed to get the project running against a real
Supabase backend, from zero. No prior Supabase experience assumed.

## 1. Create a Supabase account & project

1. Go to https://supabase.com and sign up (GitHub login is fastest).
2. Click **New Project**.
   - Pick any organization (or create one — it's just a folder for your projects).
   - Name: `church-website` (or anything you like).
   - Database password: generate one and **save it somewhere** (a password
     manager) — you won't need it day-to-day, but you'll want it if you ever
     need to connect a database tool directly.
   - Region: pick whichever is closest to your parish/users.
3. Wait ~2 minutes for the project to finish provisioning.

## 2. Get your API keys

In your new project: **Project Settings → API**.

You need two values from that page:
- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon / public key** (a long string — this is safe to expose in the browser)

Do **not** use the `service_role` key anywhere in this project — it bypasses
Row Level Security entirely and should never be shipped to the browser.

## 3. Configure the app

In this project folder:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste in the two values from step 2:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 4. Create the database tables

In the Supabase dashboard: **SQL Editor → New query**.

Run these four files **in order** (copy-paste the whole contents of each,
click Run, then move to the next):

1. `supabase/migrations/0001_init.sql` — creates all the tables
2. `supabase/migrations/0002_rls.sql` — sets up access control (who can read/write what)
3. `supabase/migrations/0003_profile_trigger.sql` — auto-creates a staff profile
   whenever a new account signs in
4. `supabase/migrations/0004_events_extras.sql` — adds event time and photo
   fields used by the Events page

(If you'd rather use the Supabase CLI instead of pasting into the SQL editor,
that works too — `npx supabase link --project-ref <your-project-ref>` then
`npx supabase db push` — but the SQL editor is simpler for a first pass.)

## 5. Create your first admin account

There's no public sign-up page on purpose — staff accounts are created by an
admin, not by anyone who visits the site. So the very first account has to be
created manually:

1. In Supabase: **Authentication → Users → Add user → Create new user**.
   Enter an email and password for yourself.
2. This automatically creates a matching row in the `profiles` table (via the
   trigger from step 4) — but with the default role `content_manager`.
3. Go to **SQL Editor** and run, replacing the email with the one you used:

   ```sql
   update public.profiles
   set role = 'super_admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

Now that account can log in and manage everything, including promoting other
staff accounts later from `/admin/users` (once that screen is built) or via
the same kind of SQL update.

## 6. Run the app

```bash
npm install   # if you haven't already
npm run dev
```

Visit http://localhost:3000 for the public site, and
http://localhost:3000/login to sign in as staff.

## What's built so far

Every page in the PRD is built:

- Public: Home, About Us, Mass Schedule, Events (+ per-event detail page
  with RSVP and a photo gallery), Organizations, Mass Booking, Harvest &
  Thanksgiving (+ highlights gallery), Homilies (filterable by priest/year,
  with audio download), Projects
- Home page also shows an announcement banner (when one is active) and a
  Latest Sermons section
- Staff login + role-gated `/admin` area
- Admin: Announcements, Mass Schedule, Events (+ RSVP counts, + per-event
  photo gallery management), Projects, Homilies, Organizations, Parish
  History, Mass Bookings (approve/reject), Harvest Pledges (view), Baptism
  Records (add + amendments, searchable), Staff & Roles, Hero Slider
- Home page hero is managed from `/admin/hero`: add one image for a static
  hero (identical to the old fixed hero) or several for an auto-advancing
  slideshow with dots/arrows, reordered with up/down controls. Falls back
  to a placeholder hero until at least one slide is added.
- The entire `/admin` area uses a dark, "premium" dashboard design — grouped
  sidebar navigation with icons, stat cards on the dashboard, and a shared
  component library (`src/components/admin/ui.tsx`) — while every existing
  add/edit/delete action behind it is unchanged.

Event photos and the About/Harvest galleries use hosted image links or the
same `public/images/<slot>.jpg` placeholder pattern as the rest of the
site — there's no file upload pipeline in V1.

Pages render with sensible placeholder/empty states until you add real data,
so the site looks complete even on a fresh database.
