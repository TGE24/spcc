"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addBaptismRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("baptism_records").insert({
    child_name: String(formData.get("child_name")),
    parents_names: String(formData.get("parents_names")),
    date_of_birth: String(formData.get("date_of_birth") ?? "") || null,
    baptism_date: String(formData.get("baptism_date")),
    officiating_priest: String(formData.get("officiating_priest") ?? "") || null,
    godparents: String(formData.get("godparents") ?? "") || null,
    created_by: user?.id ?? null,
  });

  revalidatePath("/admin/baptism-records");
}

// Corrections go through amendments, never a direct update — matching the
// "no hard deletes, no direct edits to sacramental records" decision
// (tech spec §4.6 / §7). The RLS policy on baptism_records has no update
// rule at all, so a direct edit would fail even if this code tried it.
export async function addAmendment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("baptism_record_amendments").insert({
    baptism_record_id: String(formData.get("baptism_record_id")),
    amendment_text: String(formData.get("amendment_text")),
    amended_by: user?.id ?? null,
  });

  revalidatePath("/admin/baptism-records");
}
