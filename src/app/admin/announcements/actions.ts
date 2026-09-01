"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addAnnouncement(formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title"));
  const body = String(formData.get("body") ?? "") || null;
  const active_from = String(formData.get("active_from") ?? "") || new Date().toISOString();
  const active_to_raw = String(formData.get("active_to") ?? "");
  // Date inputs give "YYYY-MM-DD" with no time — treat active_to as end of that day.
  const active_to = active_to_raw ? `${active_to_raw}T23:59:59` : null;

  await supabase.from("announcements").insert({ title, body, active_from, active_to });

  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);

  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
