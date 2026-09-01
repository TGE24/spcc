"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addOrganization(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("organizations").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") ?? "") || null,
    mission: String(formData.get("mission") ?? "") || null,
    meeting_schedule: String(formData.get("meeting_schedule") ?? "") || null,
    leadership_contacts: String(formData.get("leadership_contacts") ?? "") || null,
    how_to_join: String(formData.get("how_to_join") ?? "") || null,
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidatePath("/about");
}

export async function deleteOrganization(id: string) {
  const supabase = await createClient();
  await supabase.from("organizations").delete().eq("id", id);

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidatePath("/about");
}
