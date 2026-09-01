"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// RLS allows anyone to insert a harvest_pledges row; only church_staff/super_admin
// can read the list (see /admin/harvest-pledges). No payment processing —
// pledges are handled offline, per the PRD's V1 decision.
export async function submitHarvestPledge(formData: FormData) {
  const supabase = await createClient();

  const pledger_name = String(formData.get("pledger_name") ?? "");
  const category = String(formData.get("category") ?? "family");
  const pledge_details = String(formData.get("pledge_details") ?? "") || null;

  const { error } = await supabase.from("harvest_pledges").insert({
    pledger_name,
    category,
    pledge_details,
  });

  if (error) {
    redirect(`/harvest?error=${encodeURIComponent("Something went wrong — please try again.")}`);
  }
  redirect("/harvest?success=1");
}
