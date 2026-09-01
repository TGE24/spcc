// Outbound email — Mailtrap Sending (production SMTP), used for the Mass
// booking confirmation + status-update emails (PRD §5.5, tech spec §5).
//
// Email is a "nice to have" layered on top of the booking flow, not part of
// its core transaction: a booking is already saved to the database by the
// time we try to send anything, so a Mailtrap outage or a missing/incorrect
// env var must never surprise a parishioner with a failed submission or
// block a staff member from approving/rejecting a booking. Every call site
// wraps sendEmail in its own try/catch and only logs on failure.
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const { MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USERNAME, MAILTRAP_PASSWORD } = process.env;
  if (!MAILTRAP_HOST || !MAILTRAP_USERNAME || !MAILTRAP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: MAILTRAP_HOST,
    port: Number(MAILTRAP_PORT ?? 587),
    auth: { user: MAILTRAP_USERNAME, pass: MAILTRAP_PASSWORD },
  });
  return transporter;
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
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      `[email] Skipped sending "${subject}" to ${to} — Mailtrap env vars (MAILTRAP_HOST/MAILTRAP_USERNAME/MAILTRAP_PASSWORD) aren't set. See SETUP.md.`
    );
    return;
  }

  const fromEmail = process.env.MAILTRAP_FROM_EMAIL;
  if (!fromEmail) {
    console.warn(`[email] Skipped sending "${subject}" to ${to} — MAILTRAP_FROM_EMAIL isn't set. See SETUP.md.`);
    return;
  }
  const fromName = process.env.MAILTRAP_FROM_NAME || siteConfig.parishFullName;

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    // Swallow — see the file-level comment. The caller already succeeded
    // at the thing that actually matters (saving the booking / updating
    // its status); losing the confirmation email shouldn't lose that too.
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}
