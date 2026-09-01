"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// RLS (event_rsvps_public_insert) allows anyone to insert an RSVP; only
// staff can read the list back (see /admin/events RSVP counts).
export async function submitRsvp(formData: FormData) {
  const supabase = await createClient();

  const event_id = String(formData.get("event_id"));
  const full_name = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");

  const { error } = await supabase.from("event_rsvps").insert({
    event_id,
    full_name,
    email,
  });

  if (error) {
    redirect(`/events/${event_id}?error=${encodeURIComponent("Something went wrong — please try again.")}`);
  }
  redirect(`/events/${event_id}?success=1`);
}
