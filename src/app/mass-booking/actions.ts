"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// RLS (0002_rls.sql) allows anyone to insert a mass_bookings row; only
// church_staff/super_admin can read or update status (see /admin/mass-bookings).
export async function submitMassBooking(formData: FormData) {
  const supabase = await createClient();

  const full_name = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "") || null;
  const intention_type = String(formData.get("intention_type") ?? "");
  const preferred_date = String(formData.get("preferred_date") ?? "");
  const message = String(formData.get("message") ?? "") || null;

  const { error } = await supabase.from("mass_bookings").insert({
    full_name,
    email,
    phone,
    intention_type,
    preferred_date,
    message,
  });

  if (error) {
    redirect(`/mass-booking?error=${encodeURIComponent("Something went wrong — please try again.")}`);
  }
  redirect("/mass-booking?success=1");
}
