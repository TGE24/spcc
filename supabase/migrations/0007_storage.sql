-- Image upload pipeline (closes the "no Storage upload pipeline in V1" gap
-- flagged during the PRD review). Previously hero_slides.image_url and
-- event_photos.image_url were just pasted external links; staff now upload
-- files directly from /admin/hero and /admin/events/[id]/photos.
--
-- One shared public bucket rather than one per feature — both consumers
-- are public-facing marketing images with the exact same staff write
-- roles (mirrors the hero_slides_staff_write / event_photos_staff_write
-- table policies), so a single bucket with one set of policies covers
-- both without duplication. Uploads go through the signed-in staff
-- member's own session (see src/lib/storage.ts), the same as every other
-- write in this app — no service-role key involved.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Public read (matches hero_slides_public_read / event_photos_public_read
-- — these images are meant to be viewed by anyone on the public site).
-- The bucket is also flagged public above, so reads work even for a
-- signed-out visitor without this policy, but it's kept explicit for
-- parity with every other table in this schema and for admin-side
-- listing/download calls, which do go through RLS.
create policy "site_images_public_read" on storage.objects for select using (
  bucket_id = 'site-images'
);

-- Staff write — same three roles as hero_slides/event_photos content
-- tables. INSERT + UPDATE (not just INSERT) because the Storage client's
-- upsert path needs both (a plain re-upload to a fresh generated path
-- never hits UPDATE in practice, but this keeps the policy correct if
-- that ever changes) — see the Supabase Storage RLS gotcha: "upsert
-- requires INSERT + SELECT + UPDATE." SELECT is covered by the public
-- read policy above.
create policy "site_images_staff_insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'site-images'
  and public.current_user_role() in ('super_admin','church_staff','content_manager')
);
create policy "site_images_staff_update" on storage.objects for update to authenticated using (
  bucket_id = 'site-images'
  and public.current_user_role() in ('super_admin','church_staff','content_manager')
) with check (
  bucket_id = 'site-images'
  and public.current_user_role() in ('super_admin','church_staff','content_manager')
);
create policy "site_images_staff_delete" on storage.objects for delete to authenticated using (
  bucket_id = 'site-images'
  and public.current_user_role() in ('super_admin','church_staff','content_manager')
);
