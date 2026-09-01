"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addMassTime(formData: FormData) {
  const supabase = await createClient();
  const day_type = String(formData.get("day_type"));
  const time = String(formData.get("time"));
  const label = String(formData.get("label") ?? "") || null;
  const special_date = day_type === "special" ? String(formData.get("special_date") ?? "") || null : null;
  const special_name = day_type === "special" ? String(formData.get("special_name") ?? "") || null : null;

  await supabase.from("mass_schedule").insert({
    day_type,
    time,
    label,
    special_date,
    special_name,
  });

  revalidatePath("/admin/mass-schedule");
  revalidatePath("/mass-schedule");
  revalidatePath("/");
}

export async function deleteMassTime(id: string) {
  const supabase = await createClient();
  await supabase.from("mass_schedule").delete().eq("id", id);

  revalidatePath("/admin/mass-schedule");
  revalidatePath("/mass-schedule");
  revalidatePath("/");
}
