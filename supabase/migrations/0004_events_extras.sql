-- Adds display fields the Events page (Figma "Event" design) needs beyond
-- the original Milestone 1 schema: a human-readable time string (e.g.
-- "9:00 AM") and an image slot name so admins can attach a cover photo
-- without us storing binary data or requiring Storage setup on day one.
alter table public.events
  add column if not exists event_time text,
  add column if not exists image_slot text;
