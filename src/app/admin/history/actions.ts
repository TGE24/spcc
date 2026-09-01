"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// parish_history is a single row (content = newline-separated paragraphs,
// rendered as one paragraph per line on /about). Upsert-by-id so repeated
// saves update the same row instead of accumulating duplicates.
export async function saveHistory(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "") || undefined;
  const content = String(formData.get("content") ?? "");
  const founding_date = String(formData.get("founding_date") ?? "") || null;
  const founding_priest = String(formData.get("founding_priest") ?? "") || null;

  if (id) {
    await supabase
      .from("parish_history")
      .update({ content, founding_date, founding_priest, updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await supabase.from("parish_history").insert({ content, founding_date, founding_priest });
  }

  revalidatePath("/admin/history");
  revalidatePath("/about");
}
