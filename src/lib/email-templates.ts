// Email copy for the Mass booking flow (PRD §5.5). Kept as plain,
// inline-styled HTML rather than a templating library — two short emails
// don't need one, and inline styles are the one thing that reliably
// survives every email client's CSS stripping.
import { siteConfig } from "@/lib/site-config";
import type { MassBooking } from "@/types/database";

// The public booking form calls the confirmation email before the row has
// an id/status/created_at (it's built from the submitted form fields, not
// re-fetched from the database), so both templates only ask for the fields
// they actually render rather than a full MassBooking row.
type BookingEmailFields = Pick<MassBooking, "full_name" | "preferred_date" | "intention_type">;

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function wrap(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#101828;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eaecf0;">
            <tr>
              <td style="background:#0a7b3e;padding:24px 32px;">
                <span style="font-size:20px;font-weight:600;color:#ffffff;">${siteConfig.parishFullName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#101828;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const detailsHtml = (booking: BookingEmailFields) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;font-size:14px;color:#344054;">
    <tr><td style="padding:4px 0;color:#667085;">Date</td><td style="padding:4px 0;text-align:right;">${formatDate(booking.preferred_date)}</td></tr>
    <tr><td style="padding:4px 0;color:#667085;">Intention</td><td style="padding:4px 0;text-align:right;">${booking.intention_type}</td></tr>
  </table>`;

export function massBookingConfirmationEmail(booking: BookingEmailFields) {
  const subject = "We've received your Mass intention request";
  const html = wrap(
    subject,
    `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#344054;">Hi ${booking.full_name},</p>
     <p style="margin:0;font-size:14px;line-height:1.6;color:#344054;">
       Thank you for submitting a Mass intention request. Our parish office has received it and
       will follow up if anything needs confirming.
     </p>
     ${detailsHtml(booking)}
     <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#667085;">
       If anything above isn't right, just reply to this email or contact the parish office.
     </p>`
  );
  const text = `Hi ${booking.full_name},

Thank you for submitting a Mass intention request. Our parish office has received it and will follow up if anything needs confirming.

Date: ${formatDate(booking.preferred_date)}
Intention: ${booking.intention_type}

If anything above isn't right, just reply to this email or contact the parish office.

— ${siteConfig.parishFullName}`;

  return { subject, html, text };
}

export function massBookingStatusEmail(booking: BookingEmailFields, status: "approved" | "rejected") {
  if (status === "approved") {
    const subject = "Your Mass intention request has been approved";
    const html = wrap(
      subject,
      `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#344054;">Hi ${booking.full_name},</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#344054;">
         Good news — your Mass intention request has been approved. We look forward to seeing you.
       </p>
       ${detailsHtml(booking)}`
    );
    const text = `Hi ${booking.full_name},

Good news — your Mass intention request has been approved. We look forward to seeing you.

Date: ${formatDate(booking.preferred_date)}
Intention: ${booking.intention_type}

— ${siteConfig.parishFullName}`;
    return { subject, html, text };
  }

  const subject = "An update on your Mass intention request";
  const html = wrap(
    subject,
    `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#344054;">Hi ${booking.full_name},</p>
     <p style="margin:0;font-size:14px;line-height:1.6;color:#344054;">
       Thank you for your Mass intention request. We're unable to accommodate it as submitted —
       please contact the parish office so we can find another date together.
     </p>
     ${detailsHtml(booking)}
     <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#667085;">
       ${siteConfig.address} · ${siteConfig.email}
     </p>`
  );
  const text = `Hi ${booking.full_name},

Thank you for your Mass intention request. We're unable to accommodate it as submitted — please contact the parish office so we can find another date together.

Date: ${formatDate(booking.preferred_date)}
Intention: ${booking.intention_type}

${siteConfig.address} · ${siteConfig.email}

— ${siteConfig.parishFullName}`;
  return { subject, html, text };
}
