"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteImageByUrl, uploadImage } from "@/lib/storage";
import type { EventPhoto } from "@/types/database";

// event_photos_staff_write (RLS) restricts these ops to staff; public read
// is separately allowed so the gallery shows on /events/[id] with no auth.
// Photos upload straight to Supabase Storage (supabase/migrations/
// 0007_storage.sql, src/lib/storage.ts) under events/<event_id>/...
export async function addEventPhoto(formData: FormData) {
  const event_id = String(formData.get("event_id"));
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    redirect(`/admin/events/${event_id}/photos?error=${encodeURIComponent("Please choose a photo to upload.")}`);
  }

  const uploaded = await uploadImage(image, `events/${event_id}`);
  if (!uploaded.ok) {
    redirect(`/admin/events/${event_id}/photos?error=${encodeURIComponent(uploaded.error)}`);
  }
  const imageUrl = uploaded.url;

  const supabase = await createClient();
  const { error: insertError } = await supabase
    .from("event_photos")
    .insert({ event_id, image_url: imageUrl });

  revalidatePath(`/admin/events/${event_id}/photos`);
  revalidatePath(`/events/${event_id}`);

  if (insertError) {
    // The file made it into Storage but the row failed — clean up the
    // now-orphaned upload and surface the failure instead of silently
    // doing nothing (the previous version of this action didn't check
    // this error at all).
    await deleteImageByUrl(imageUrl);
    redirect(
      `/admin/events/${event_id}/photos?error=${encodeURIComponent("Upload succeeded, but saving the photo failed: " + insertError.message)}`
    );
  }
}

export async function deleteEventPhoto(eventId: string, photoId: string) {
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("event_photos")
    .delete()
    .eq("id", photoId)
    .select()
    .single<EventPhoto>();

  revalidatePath(`/admin/events/${eventId}/photos`);
  revalidatePath(`/events/${eventId}`);

  if (photo) {
    await deleteImageByUrl(photo.image_url);
  }
}
