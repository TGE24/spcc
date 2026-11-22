"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

// When the form was pre-filled from a baptism request (?from=<id>), the
// request's id rides along as `inquiry_id`. Saving the record then closes
// that request, so it drops out of the "to do" list and can't be entered
// twice. On failure we send the user back to the same pre-filled form.
export async function addBaptismRecord(formData: FormData) {
  const inquiryId = text(formData, "inquiry_id");
  const back = inquiryId ? `/admin/baptism-records?from=${encodeURIComponent(inquiryId)}&` : "/admin/baptism-records?";

  function fail(message: string): never {
    redirect(`${back}error=${encodeURIComponent(message)}`);
  }

  const childName = text(formData, "child_name");
  const parentsNames = text(formData, "parents_names");
  const baptismDate = text(formData, "baptism_date");
  const dateOfBirth = text(formData, "date_of_birth");
  if (!childName || !parentsNames || !baptismDate) {
    fail("Child's name, parents' names and baptism date are required.");
  }
  if (dateOfBirth && dateOfBirth > baptismDate) {
    fail("The date of birth can't be after the baptism date.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("baptism_records").insert({
    child_name: childName,
    parents_names: parentsNames,
    date_of_birth: dateOfBirth || null,
    baptism_date: baptismDate,
    officiating_priest: text(formData, "officiating_priest") || null,
    godparents: text(formData, "godparents") || null,
    created_by: user?.id ?? null,
  });
  if (error) fail("Couldn't save the record. Please try again.");

  if (inquiryId) {
    await supabase.from("baptism_inquiries").update({ status: "closed" }).eq("id", inquiryId);
    revalidatePath("/admin/baptism-inquiries");
    revalidatePath(`/admin/baptism-inquiries/${inquiryId}`);
  }

  revalidatePath("/admin/baptism-records");
  redirect(`/admin/baptism-records?added=${encodeURIComponent(childName)}`);
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
