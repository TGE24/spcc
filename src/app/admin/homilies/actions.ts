"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addHomily(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("homilies").insert({
    title: String(formData.get("title")),
    date: String(formData.get("date")),
    priest_name: String(formData.get("priest_name") ?? "") || null,
    bible_reference: String(formData.get("bible_reference") ?? "") || null,
    audio_url: String(formData.get("audio_url")),
  });

  revalidatePath("/admin/homilies");
  revalidatePath("/homilies");
}

export async function deleteHomily(id: string) {
  const supabase = await createClient();
  await supabase.from("homilies").delete().eq("id", id);

  revalidatePath("/admin/homilies");
  revalidatePath("/homilies");
}
