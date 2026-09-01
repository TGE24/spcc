"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addProject(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("projects").insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") ?? "") || null,
    budget_details: String(formData.get("budget_details") ?? "") || null,
    progress_update: String(formData.get("progress_update") ?? "") || null,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}
