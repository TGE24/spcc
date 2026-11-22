"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { baptismInquiryConfirmationEmail } from "@/lib/email-templates";
import { todayISODate } from "@/lib/events";

// RLS (0006 + 0011) allows anyone to insert a baptism_inquiries row, but only
// as 'pending' with no schedule; only church_staff/super_admin can read it or
// schedule it (see /admin/baptism-inquiries). Deliberately separate from
// addBaptismRecord (/admin/baptism-records/actions.ts), which writes the
// permanent, staff-only sacramental register — that table has no public
// insert path at all (tech spec §4.6).
//
// Fields follow the parish's paper "Baptismal Particulars" form. The browser
// enforces the same rules first (required fields, date limits, at least one
// parent), so these server checks are a backstop, not the main UX.
function fail(message: string): never {
  redirect(`/baptism-request?error=${encodeURIComponent(message)}`);
}

export async function submitBaptismInquiry(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim() || null;

  const family_name = text("family_name");
  const baptismal_name = text("baptismal_name");
  const other_names = text("other_names");
  const child_date_of_birth = text("child_date_of_birth");
  const place_of_birth = text("place_of_birth");
  const town_of_origin = text("town_of_origin");
  const address = text("address");
  const father_name = text("father_name");
  const mother_name = text("mother_name");
  const godfather_name = text("godfather_name");
  const godmother_name = text("godmother_name");
  const email = text("email");
  const phone = text("phone");
  const preferred_date = text("preferred_date");
  const message = text("message");

  if (!family_name || !baptismal_name) fail("Please enter the child's family name and baptismal name.");
  if (!child_date_of_birth || !place_of_birth) fail("Please enter the child's date and place of birth.");
  if (!address) fail("Please enter your address in Ibadan.");
  if (!father_name && !mother_name) fail("Please enter at least one parent's name.");
  if (!email) fail("Please enter an email address so we can confirm the baptism date with you.");

  const today = todayISODate();
  if (child_date_of_birth > today) fail("The date of birth can't be in the future.");
  if (preferred_date && preferred_date < today) fail("The preferred baptism date can't be in the past.");

  // Composed for the older child_name / parent_name columns, which the
  // admin list, emails and baptism records still read.
  const child_name = [baptismal_name, other_names, family_name].filter(Boolean).join(" ");
  const parent_name = [father_name, mother_name].filter(Boolean).join(" & ");

  const supabase = await createClient();
  const { error } = await supabase.from("baptism_inquiries").insert({
    family_name,
    baptismal_name,
    other_names,
    child_name,
    child_date_of_birth,
    place_of_birth,
    town_of_origin,
    address,
    father_name,
    mother_name,
    parent_name,
    godfather_name,
    godmother_name,
    email,
    phone,
    preferred_date,
    message,
  });

  if (error) fail("Something went wrong. Please try again.");

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
