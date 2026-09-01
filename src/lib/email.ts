// Outbound email — Resend, used for the Mass booking confirmation +
// status-update emails (PRD §5.5, tech spec §5).
//
// Email is a "nice to have" layered on top of the booking flow, not part of
// its core transaction: a booking is already saved to the database by the
// time we try to send anything, so a Resend outage or a missing/incorrect
// env var must never surprise a parishioner with a failed submission or
// block a staff member from approving/rejecting a booking. Every call site
// treats sendEmail as fire-and-forget-but-awaited — it swallows its own
// errors and only logs a warning.
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

let resend: Resend | null = null;

function getClient() {
  if (resend) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resend = new Resend(apiKey);
  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const client = getClient();
  if (!client) {
    console.warn(`[email] Skipped sending "${subject}" to ${to} — RESEND_API_KEY isn't set. See SETUP.md.`);
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    console.warn(`[email] Skipped sending "${subject}" to ${to} — RESEND_FROM_EMAIL isn't set. See SETUP.md.`);
    return;
  }
  const fromName = process.env.RESEND_FROM_NAME || siteConfig.parishFullName;

  try {
    const { error } = await client.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      // Resend's SDK returns send failures as a typed `error` field rather
      // than throwing — this is the failure path, not a thrown exception.
      console.error(`[email] Resend rejected "${subject}" to ${to}:`, error);
    }
  } catch (err) {
    // Swallow — see the file-level comment. The caller already succeeded
    // at the thing that actually matters (saving the booking / updating
    // its status); losing the confirmation email shouldn't lose that too.
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}
