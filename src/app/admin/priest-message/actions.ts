"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// priest_message is a single row (message = newline-separated paragraphs,
// same convention as parish_history.content). Upsert-by-id so repeated
// saves update the same row instead of accumulating duplicates. Leaving
// both fields blank and saving is how staff take the section back down
// off the Home page — see the empty-message check in src/app/page.tsx.
export async function savePriestMessage(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "") || undefined;
  const heading = String(formData.get("heading") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  if (id) {
    await supabase
      .from("priest_message")
      .update({ heading, message, updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await supabase.from("priest_message").insert({ heading, message });
  }

  revalidatePath("/admin/priest-message");
  revalidatePath("/");
}
