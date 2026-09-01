"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { baptismInquiryConfirmationEmail } from "@/lib/email-templates";

// RLS (0006_baptism_inquiries.sql) allows anyone to insert a
// baptism_inquiries row; only church_staff/super_admin can read or update
// status (see /admin/baptism-inquiries). Deliberately separate from
// addBaptismRecord (/admin/baptism-records/actions.ts), which writes the
// permanent, staff-only sacramental register — that table has no public
// insert path at all (tech spec §4.6).
export async function submitBaptismInquiry(formData: FormData) {
  const supabase = await createClient();

  const parent_name = String(formData.get("parent_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "") || null;
  const child_name = String(formData.get("child_name") ?? "");
  const child_date_of_birth = String(formData.get("child_date_of_birth") ?? "") || null;
  const preferred_date = String(formData.get("preferred_date") ?? "") || null;
  const message = String(formData.get("message") ?? "") || null;

  const { error } = await supabase.from("baptism_inquiries").insert({
    parent_name,
    email,
    phone,
    child_name,
    child_date_of_birth,
    preferred_date,
    message,
  });

  if (error) {
    redirect(`/baptism-request?error=${encodeURIComponent("Something went wrong — please try again.")}`);
  }

  // Confirmation email — never blocks/fails the request itself; sendEmail
  // swallows its own errors (see src/lib/email.ts), so a Resend hiccup
  // can never turn a successfully saved request into an error page for
  // the parent.
  await sendEmail({
    to: email,
    ...baptismInquiryConfirmationEmail({ parent_name, child_name, preferred_date }),
  });

  redirect("/baptism-request?success=1");
}
