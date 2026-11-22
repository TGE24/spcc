"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteImageByUrl, uploadImage } from "@/lib/storage";
import type { ChurchEvent } from "@/types/database";

function revalidateEvent(id?: string) {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  if (id) {
    revalidatePath(`/admin/events/${id}`);
    revalidatePath(`/events/${id}`);
  }
}

// Text fields shared by the add and edit forms (event-fields.tsx).
function readEventFields(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim() || null;
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: text("description"),
    event_date: String(formData.get("event_date") ?? ""),
    event_time: text("event_time"),
    location: text("location"),
    recap: text("recap"),
  };
}

function coverFile(formData: FormData) {
  const file = formData.get("cover");
  return file instanceof File && file.size > 0 ? file : null;
}

export async function addEvent(formData: FormData) {
  const fields = readEventFields(formData);
  if (!fields.title || !fields.event_date) {
    redirect(`/admin/events?error=${encodeURIComponent("An event needs at least a title and a date.")}`);
  }

  let cover_image_url: string | null = null;
  const file = coverFile(formData);
  if (file) {
    const uploaded = await uploadImage(file, "events/covers");
    if (!uploaded.ok) redirect(`/admin/events?error=${encodeURIComponent(uploaded.error)}`);
    cover_image_url = uploaded.url;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ ...fields, cover_image_url });

  revalidateEvent();

  if (error) {
    if (cover_image_url) await deleteImageByUrl(cover_image_url);
    redirect(`/admin/events?error=${encodeURIComponent("Saving the event failed: " + error.message)}`);
  }
  redirect("/admin/events?saved=1");
}

// Replacing the cover uploads the new file first and only removes the old
// one once the row points at the new URL, so a failed save never leaves
// the event pointing at a deleted file.
export async function updateEvent(id: string, formData: FormData) {
  const back = `/admin/events/${id}`;
  const fields = readEventFields(formData);
  if (!fields.title || !fields.event_date) {
    redirect(`${back}?error=${encodeURIComponent("An event needs at least a title and a date.")}`);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("events")
    .select("cover_image_url")
    .eq("id", id)
    .maybeSingle<Pick<ChurchEvent, "cover_image_url">>();
  if (!existing) redirect("/admin/events");

  let cover_image_url = existing.cover_image_url;
  const file = coverFile(formData);
  if (file) {
    const uploaded = await uploadImage(file, "events/covers");
    if (!uploaded.ok) redirect(`${back}?error=${encodeURIComponent(uploaded.error)}`);
    cover_image_url = uploaded.url;
  } else if (formData.get("remove_cover") === "on") {
    cover_image_url = null;
  }

  const { error } = await supabase
    .from("events")
    .update({ ...fields, cover_image_url })
    .eq("id", id);

  revalidateEvent(id);

  if (error) {
    if (file && cover_image_url) await deleteImageByUrl(cover_image_url);
    redirect(`${back}?error=${encodeURIComponent("Saving the event failed: " + error.message)}`);
  }
  if (existing.cover_image_url && existing.cover_image_url !== cover_image_url) {
    await deleteImageByUrl(existing.cover_image_url);
  }
  redirect(`${back}?saved=1`);
}

// event_photos and event_rsvps rows cascade with the event; their Storage
// files don't, so clean those up best-effort once the row is gone.
export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("event_photos")
    .select("image_url")
    .eq("event_id", id)
    .returns<{ image_url: string }[]>();
  const { data: event } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("cover_image_url")
    .maybeSingle<Pick<ChurchEvent, "cover_image_url">>();

  revalidateEvent(id);

  if (event) {
    const urls = [event.cover_image_url, ...(photos ?? []).map((p) => p.image_url)];
    await Promise.all(urls.filter((u): u is string => !!u).map(deleteImageByUrl));
  }
}
