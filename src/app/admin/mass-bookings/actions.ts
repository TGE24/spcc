"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { massBookingStatusEmail } from "@/lib/email-templates";
import type { MassBooking } from "@/types/database";

export async function updateBookingStatus(id: string, status: "approved" | "rejected" | "pending") {
  const supabase = await createClient();

  // .select().single() gets the updated row back in the same round trip —
  // needed for the status-update email below (full_name/email/date/
  // intention_type), so there's no second query just to fetch what we
  // already just wrote.
  const { data: booking } = await supabase
    .from("mass_bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single<MassBooking>();

  revalidatePath("/admin/mass-bookings");

  // Status-update email — not in the PRD, but a natural follow-up to the
  // booking confirmation email (PRD §5.5). Only fires for the two terminal
  // states; "pending" is the initial state and isn't reachable from this
  // action's UI, but the type allows it, so it's excluded explicitly.
  let emailed = true;
  if (booking && (status === "approved" || status === "rejected")) {
    emailed = await sendEmail({
      to: booking.email,
      ...massBookingStatusEmail(booking, status),
    });
  }

  // Always land back on a clean URL, so a warning from one decision never
  // lingers on screen after the next one.
  redirect(
    emailed || !booking
      ? "/admin/mass-bookings"
      : `/admin/mass-bookings?emailFailed=${encodeURIComponent(`${booking.full_name} <${booking.email}>`)}`
  );
}
