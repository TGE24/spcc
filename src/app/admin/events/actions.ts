"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addEvent(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("events").insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") ?? "") || null,
    event_date: String(formData.get("event_date")),
    event_time: String(formData.get("event_time") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    image_slot: String(formData.get("image_slot") ?? "") || null,
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
