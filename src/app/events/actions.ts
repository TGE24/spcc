"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isPastEvent } from "@/lib/events";
import { sendEmail } from "@/lib/email";
import { rsvpConfirmationEmail } from "@/lib/email-templates";
import type { ChurchEvent } from "@/types/database";

export type RsvpState =
  | { status: "idle" }
  | { status: "success"; name: string; emailed: boolean }
  | { status: "error"; message: string };

// Called from the RSVP dialog on upcoming event cards (useActionState), so
// it returns a result instead of redirecting — the dialog shows the outcome
// in place. RLS (event_rsvps_public_insert) allows anyone to insert; only
// staff can read the list back (see /admin/events RSVP counts).
export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const event_id = String(formData.get("event_id") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!full_name || !email) {
    return { status: "error", message: "Please add your name and email so we know who's coming." };
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, event_date, event_time, location")
    .eq("id", event_id)
    .maybeSingle<Pick<ChurchEvent, "title" | "event_date" | "event_time" | "location">>();

  if (!event) {
    return { status: "error", message: "We couldn't find this event — it may have been removed." };
  }
  if (isPastEvent(event)) {
    return { status: "error", message: "This event has already taken place, so RSVPs are closed." };
  }

  const { error } = await supabase.from("event_rsvps").insert({ event_id, full_name, email });
  if (error) {
    return { status: "error", message: "Something went wrong saving your RSVP — please try again." };
  }

  revalidatePath("/admin/events");

  // Confirmation with the event details. sendEmail never throws (see
  // src/lib/email.ts), so an email problem can't undo a saved RSVP.
  const emailed = await sendEmail({ to: email, ...rsvpConfirmationEmail({ full_name, event }) });

  return { status: "success", name: full_name.split(" ")[0], emailed };
}
