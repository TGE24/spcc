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
  if (uploaded.error) {
    redirect(`/admin/events/${event_id}/photos?error=${encodeURIComponent(uploaded.error)}`);
  }

  const supabase = await createClient();
  await supabase.from("event_photos").insert({ event_id, image_url: uploaded.url });

  revalidatePath(`/admin/events/${event_id}/photos`);
  revalidatePath(`/events/${event_id}`);
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
