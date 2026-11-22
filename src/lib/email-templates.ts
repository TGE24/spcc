// Email copy for the Mass booking and baptism request flows (PRD §5.5/§5.6).
// Plain inline-styled HTML rather than a templating library: inline styles
// and table layout are what reliably survive every email client's CSS
// stripping (Gmail, Outlook, Apple Mail).
//
// The look matches the staff login and the Supabase auth emails in
// supabase/templates/: St. Patrick Green header with a Mitre Gold rule,
// parchment page, gold buttons, and the parish's contact details in the
// footer. Keep the two in step if the design changes.
import { siteConfig } from "@/lib/site-config";
import { EMAIL_LOGO_CID } from "@/lib/email-logo";
import { formatTime } from "@/lib/time";
import type { MassBooking, BaptismInquiry } from "@/types/database";

// The public booking form calls the confirmation email before the row has
// an id/status/created_at (it's built from the submitted form fields, not
// re-fetched from the database), so both templates only ask for the fields
// they actually render rather than a full MassBooking row.
type BookingEmailFields = Pick<MassBooking, "full_name" | "preferred_date" | "intention_type">;

const color = {
  green: "#12341D",
  vestment: "#2F5A34",
  gold: "#B08D47",
  goldLight: "#D7BA78",
  goldText: "#7A5E24",
  parchment: "#FAF8EE",
  tint: "#F2EFDF",
  rule: "#ECE8D4",
  border: "#E4E0C9",
  ink: "#16211A",
  body: "#344A3B",
  muted: "#4B5A4E",
};

// Names and intentions are typed by parishioners into public forms, so
// they're escaped before going into HTML.
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function paragraph(html: string, last = false) {
  return `<p style="margin:0 0 ${last ? 0 : 12}px;font-size:15px;line-height:1.6;color:${color.body};">${html}</p>`;
}

function details(rows: [label: string, value: string][]) {
  const cells = rows
    .map(
      ([label, value], i) => `
        <tr>
          <td style="padding:10px 16px;${i ? `border-top:1px solid ${color.rule};` : ""}font-size:13px;color:${color.muted};white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:10px 16px;${i ? `border-top:1px solid ${color.rule};` : ""}font-size:14px;font-weight:600;color:${color.ink};text-align:right;">${value}</td>
        </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;background:${color.parchment};border:1px solid ${color.rule};border-radius:12px;border-collapse:separate;">
      ${cells}
    </table>`;
}

// Table-based so the button renders in Outlook too.
function button(label: string, href: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;">
      <tr>
        <td align="center" bgcolor="${color.goldLight}" style="border-radius:12px;background:${color.goldLight};">
          <a href="${href}" target="_blank" style="display:block;padding:14px 24px;font-size:15px;font-weight:600;line-height:20px;color:${color.green};text-decoration:none;border-radius:12px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

function layout({ preview, title, body }: { preview: string; title: string; body: string }) {
  const phone = siteConfig.phones[0];
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${color.tint};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${color.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${color.border};">
            <tr>
              <td style="background:${color.green};padding:24px 32px;border-bottom:3px solid ${color.gold};">
                <!-- Inline attachment (see src/lib/email-logo.ts and sendEmail),
                     PNG for email-client support; alt text keeps the parish
                     name readable when images are blocked. -->
                <img src="cid:${EMAIL_LOGO_CID}" width="320" height="43" alt="${siteConfig.parishFullName}" style="display:block;max-width:100%;height:auto;border:0;color:${color.parchment};font-size:18px;font-weight:600;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 28px;">
                <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;font-weight:600;color:${color.ink};">${title}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid ${color.rule};">
                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${color.goldText};">${siteConfig.parishFullName}</p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:${color.muted};">
                  ${siteConfig.address}<br />
                  <a href="tel:${phone.replace(/\s/g, "")}" style="color:${color.muted};text-decoration:none;">${phone}</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:${siteConfig.email}" style="color:${color.vestment};text-decoration:underline;">${siteConfig.email}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const textFooter = () => `
—
${siteConfig.parishFullName}
${siteConfig.address}
${siteConfig.phones[0]} · ${siteConfig.email}`;

const bookingRows = (booking: BookingEmailFields): [string, string][] => [
  ["Date", formatDate(booking.preferred_date)],
  ["Intention", esc(booking.intention_type)],
];

const bookingText = (booking: BookingEmailFields) =>
  `Date: ${formatDate(booking.preferred_date)}
Intention: ${booking.intention_type}`;

export function massBookingConfirmationEmail(booking: BookingEmailFields) {
  const subject = "We've received your Mass intention request";
  const html = layout({
    preview: `Your request for ${formatDate(booking.preferred_date)} is with the parish office.`,
    title: "Your Mass intention request is in",
    body: `
      ${paragraph(`Dear ${esc(booking.full_name)},`)}
      ${paragraph(
        "Thank you for your Mass intention request. The parish office has received it and will be in touch if anything needs confirming. You'll get another email once the office has reviewed it.",
        true
      )}
      ${details(bookingRows(booking))}
      ${button("See the Mass schedule", `${siteConfig.siteUrl}/mass-schedule`)}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${color.muted};">
        Something not right? Reply to this email or contact the parish office.
      </p>`,
  });
  const text = `Dear ${booking.full_name},

Thank you for your Mass intention request. The parish office has received it and will be in touch if anything needs confirming. You'll get another email once the office has reviewed it.

${bookingText(booking)}

Mass schedule: ${siteConfig.siteUrl}/mass-schedule

Something not right? Reply to this email or contact the parish office.
${textFooter()}`;

  return { subject, html, text };
}

export function massBookingStatusEmail(booking: BookingEmailFields, status: "approved" | "rejected") {
  if (status === "approved") {
    const subject = "Your Mass intention request has been approved";
    const html = layout({
      preview: `Your Mass intention for ${formatDate(booking.preferred_date)} has been approved.`,
      title: "Your Mass intention has been approved",
      body: `
        ${paragraph(`Dear ${esc(booking.full_name)},`)}
        ${paragraph("Your Mass intention request has been approved. We look forward to praying with you.", true)}
        ${details([...bookingRows(booking), ["Status", `<span style="color:${color.vestment};">Approved</span>`]])}
        ${button("See the Mass schedule", `${siteConfig.siteUrl}/mass-schedule`)}`,
    });
    const text = `Dear ${booking.full_name},

Your Mass intention request has been approved. We look forward to praying with you.

${bookingText(booking)}
Status: Approved

Mass schedule: ${siteConfig.siteUrl}/mass-schedule
${textFooter()}`;
    return { subject, html, text };
  }

  const subject = "An update on your Mass intention request";
  const html = layout({
    preview: "We couldn't accommodate your request as submitted. Let's find another date.",
    title: "An update on your Mass intention request",
    body: `
      ${paragraph(`Dear ${esc(booking.full_name)},`)}
      ${paragraph(
        "Thank you for your Mass intention request. We're unable to accommodate it as submitted. Please contact the parish office so we can find another date together.",
        true
      )}
      ${details(bookingRows(booking))}
      ${button("Email the parish office", `mailto:${siteConfig.email}`)}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${color.muted};">
        Or call us on ${siteConfig.phones[0]}.
      </p>`,
  });
  const text = `Dear ${booking.full_name},

Thank you for your Mass intention request. We're unable to accommodate it as submitted. Please contact the parish office so we can find another date together.

${bookingText(booking)}

Email: ${siteConfig.email}
Phone: ${siteConfig.phones[0]}
${textFooter()}`;
  return { subject, html, text };
}

// Baptism request confirmation (mirrors the mass-booking confirmation
// email's shape/tone). Only a submission confirmation — there's no
// status-change email here the way mass bookings have one, because the
// "contacted"/"closed" transitions in /admin/baptism-inquiries reflect a
// phone/email follow-up staff have already had directly with the parent,
// not a decision the parent is waiting to hear by email.
type BaptismInquiryEmailFields = Pick<BaptismInquiry, "parent_name" | "child_name" | "preferred_date">;

export function baptismInquiryConfirmationEmail(inquiry: BaptismInquiryEmailFields) {
  const subject = "We've received your baptism request";
  const rows: [string, string][] = [["Child", esc(inquiry.child_name)]];
  if (inquiry.preferred_date) rows.push(["Preferred date", formatDate(inquiry.preferred_date)]);
  const dateText = inquiry.preferred_date ? `\nPreferred date: ${formatDate(inquiry.preferred_date)}` : "";

  const html = layout({
    preview: `Your request for ${esc(inquiry.child_name)}'s baptism is with the parish office.`,
    title: "Your baptism request is in",
    body: `
      ${paragraph(`Dear ${esc(inquiry.parent_name)},`)}
      ${paragraph(
        `Thank you for requesting baptism for ${esc(inquiry.child_name)}. The parish office has received your request and will be in touch soon to arrange next steps with the priest.`,
        true
      )}
      ${details(rows)}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${color.muted};">
        Something not right? Reply to this email or contact the parish office.
      </p>`,
  });
  const text = `Dear ${inquiry.parent_name},

Thank you for requesting baptism for ${inquiry.child_name}. The parish office has received your request and will be in touch soon to arrange next steps with the priest.

Child: ${inquiry.child_name}${dateText}

Something not right? Reply to this email or contact the parish office.
${textFooter()}`;

  return { subject, html, text };
}

// Sent when staff confirm a request by scheduling it (and again with
// `rescheduled` if they change the dates). Carries both appointments from
// the paper form: the baptism itself and the practice parents and
// godparents must attend beforehand.
type BaptismScheduleFields = Pick<
  BaptismInquiry,
  | "parent_name"
  | "child_name"
  | "baptism_date"
  | "baptism_time"
  | "baptism_place"
  | "practice_date"
  | "practice_time"
  | "practice_place"
>;

function when(date: string | null, time: string | null) {
  if (!date) return "";
  return [formatDate(date), formatTime(time)].filter(Boolean).join(", ");
}

export function baptismScheduledEmail(inquiry: BaptismScheduleFields, { rescheduled = false } = {}) {
  const baptismWhen = when(inquiry.baptism_date, inquiry.baptism_time);
  const practiceWhen = when(inquiry.practice_date, inquiry.practice_time);
  const subject = rescheduled
    ? `Updated baptism dates for ${inquiry.child_name}`
    : `${inquiry.child_name}'s baptism is confirmed`;

  const html = layout({
    preview: `Baptism: ${baptismWhen}. Practice for parents and godparents: ${practiceWhen}.`,
    title: rescheduled ? "The baptism dates have changed" : "Your child's baptism is confirmed",
    body: `
      ${paragraph(`Dear ${esc(inquiry.parent_name)},`)}
      ${paragraph(
        rescheduled
          ? `The parish office has updated the dates for ${esc(inquiry.child_name)}'s baptism. Please use the new dates below.`
          : `We're delighted to confirm ${esc(inquiry.child_name)}'s baptism at St. Patrick's. Here are the details.`,
        true
      )}
      ${details([
        ["Baptism", esc(baptismWhen)],
        ["Place", esc(inquiry.baptism_place ?? "")],
      ])}
      <p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:${color.body};">
        <strong style="color:${color.ink};">Parents and godparents must attend the practice</strong> before the baptism:
      </p>
      ${details([
        ["Practice", esc(practiceWhen)],
        ["Place", esc(inquiry.practice_place ?? "")],
      ])}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${color.muted};">
        Can't make one of these dates? Reply to this email or call the parish office on ${siteConfig.phones[0]}.
      </p>`,
  });

  const text = `Dear ${inquiry.parent_name},

${
  rescheduled
    ? `The parish office has updated the dates for ${inquiry.child_name}'s baptism. Please use the new dates below.`
    : `We're delighted to confirm ${inquiry.child_name}'s baptism at St. Patrick's. Here are the details.`
}

BAPTISM
${baptismWhen}
${inquiry.baptism_place ?? ""}

PRACTICE (parents and godparents must attend)
${practiceWhen}
${inquiry.practice_place ?? ""}

Can't make one of these dates? Reply to this email or call the parish office on ${siteConfig.phones[0]}.
${textFooter()}`;

  return { subject, html, text };
}
