"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { baptismScheduledEmail } from "@/lib/email-templates";
import { todayISODate } from "@/lib/events";
import type { BaptismInquiry } from "@/types/database";

// "contacted"/"closed" reflect a follow-up staff have had directly with the
// parent, so no email fires for them. Scheduling (below) is the decision the
// family is waiting on, so that one does email them. Once the baptism takes
// place, staff create the permanent record via addBaptismRecord
// (/admin/baptism-records/actions.ts) and then mark this request "closed".
export async function updateInquiryStatus(id: string, status: "pending" | "contacted" | "closed") {
  const supabase = await createClient();

  await supabase.from("baptism_inquiries").update({ status }).eq("id", id);

  revalidatePath("/admin/baptism-inquiries");
  revalidatePath(`/admin/baptism-inquiries/${id}`);
}

// Confirms a request by setting the baptism and the practice for parents and
// godparents. The practice must be on an earlier day than the baptism; the
// form enforces that in the browser, this re-checks it, and the database
// constraint (0011) is the last line. Saving again reschedules and sends the
// family the updated dates.
export async function scheduleBaptism(id: string, formData: FormData) {
  const back = `/admin/baptism-inquiries/${id}`;
  function fail(message: string): never {
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
  const text = (name: string) => String(formData.get(name) ?? "").trim() || null;

  const baptism_date = text("baptism_date");
  const baptism_time = text("baptism_time");
  const baptism_place = text("baptism_place");
  const practice_date = text("practice_date");
  const practice_time = text("practice_time");
  const practice_place = text("practice_place");

  if (!baptism_date || !baptism_time || !baptism_place) fail("Set the baptism's date, time and place.");
  if (!practice_date || !practice_time || !practice_place) fail("Set the practice's date, time and place.");
  if (baptism_date < todayISODate()) fail("The baptism date can't be in the past.");
  if (practice_date >= baptism_date) fail("The practice has to be on a day before the baptism.");

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("baptism_inquiries")
    .select("baptism_date")
    .eq("id", id)
    .maybeSingle<Pick<BaptismInquiry, "baptism_date">>();

  const { data: inquiry, error } = await supabase
    .from("baptism_inquiries")
    .update({
      baptism_date,
      baptism_time,
      baptism_place,
      practice_date,
      practice_time,
      practice_place,
      status: "scheduled",
      scheduled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single<BaptismInquiry>();

  if (error || !inquiry) fail(`Saving the schedule failed${error ? `: ${error.message}` : "."}`);

  revalidatePath("/admin/baptism-inquiries");
  revalidatePath(back);

  const emailed = await sendEmail({
    to: inquiry.email,
    ...baptismScheduledEmail(inquiry, { rescheduled: Boolean(before?.baptism_date) }),
  });

  // The schedule is saved either way; tell staff if the family wasn't told.
  redirect(`${back}?saved=1${emailed ? "" : "&email=failed"}`);
}
