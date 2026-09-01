"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// event_photos_staff_write (RLS) restricts these ops to staff; public read
// is separately allowed so the gallery shows on /events/[id] with no auth.
export async function addEventPhoto(formData: FormData) {
  const event_id = String(formData.get("event_id"));
  const image_url = String(formData.get("image_url") ?? "").trim();
  if (!image_url) return;

  const supabase = await createClient();
  await supabase.from("event_photos").insert({ event_id, image_url });

  revalidatePath(`/admin/events/${event_id}/photos`);
  revalidatePath(`/events/${event_id}`);
}

export async function deleteEventPhoto(eventId: string, photoId: string) {
  const supabase = await createClient();
  await supabase.from("event_photos").delete().eq("id", photoId);

  revalidatePath(`/admin/events/${eventId}/photos`);
  revalidatePath(`/events/${eventId}`);
}
