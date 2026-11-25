import { describe, expect, it } from "vitest";
import {
  baptismInquiryConfirmationEmail,
  baptismScheduledEmail,
  massBookingConfirmationEmail,
  massBookingStatusEmail,
  rsvpConfirmationEmail,
} from "@/lib/email-templates";
import { EMAIL_LOGO_CID, EMAIL_LOGO_PNG_BASE64 } from "@/lib/email-logo";
import { siteConfig } from "@/lib/site-config";
import { scheduledInquiry } from "../helpers/fixtures";

const bookingFields = { full_name: "Ada Obi", preferred_date: "2026-07-05", intention_type: "Thanksgiving" };
const hostile = `<script>alert("x")</script> & 'co'`;
const escaped = "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;co&#39;";

function expectBrandedLayout(html: string) {
  expect(html).toMatch(/^<!DOCTYPE html>/);
  expect(html).toContain(`src="cid:${EMAIL_LOGO_CID}"`);
  expect(html).toContain(`alt="${siteConfig.parishFullName}"`);
  expect(html).toContain(siteConfig.address);
  expect(html).toContain(`mailto:${siteConfig.email}`);
  expect(html).toContain(`tel:${siteConfig.phones[0].replace(/\s/g, "")}`);
}

function expectTextFooter(text: string) {
  expect(text).toContain(siteConfig.parishFullName);
  expect(text).toContain(siteConfig.email);
  expect(text).not.toMatch(/<[a-z]/i);
}

describe("massBookingConfirmationEmail", () => {
  const email = massBookingConfirmationEmail(bookingFields);

  it("has a clear subject", () => {
    expect(email.subject).toBe("We've received your Mass intention request");
  });

  it("greets the parishioner and shows the date and intention", () => {
    expect(email.html).toContain("Dear Ada Obi,");
    expect(email.html).toContain("Sunday, 5 July 2026");
    expect(email.html).toContain("Thanksgiving");
    expect(email.html).toContain(`${siteConfig.siteUrl}/mass-schedule`);
    expectBrandedLayout(email.html);
  });

  it("has a plain-text version with the same facts", () => {
    expect(email.text).toContain("Dear Ada Obi,");
    expect(email.text).toContain("Date: Sunday, 5 July 2026");
    expect(email.text).toContain("Intention: Thanksgiving");
    expectTextFooter(email.text);
  });

  it("escapes what parishioners type into the HTML", () => {
    const evil = massBookingConfirmationEmail({ ...bookingFields, full_name: hostile, intention_type: hostile });
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).toContain(escaped);
  });
});

describe("massBookingStatusEmail", () => {
  it("confirms an approved request", () => {
    const email = massBookingStatusEmail(bookingFields, "approved");
    expect(email.subject).toBe("Your Mass intention request has been approved");
    expect(email.html).toContain("Approved");
    expect(email.text).toContain("Status: Approved");
    expectBrandedLayout(email.html);
    expectTextFooter(email.text);
  });

  it("explains a rejected request and offers a way to reach the office", () => {
    const email = massBookingStatusEmail(bookingFields, "rejected");
    expect(email.subject).toBe("An update on your Mass intention request");
    expect(email.html).toContain("unable to accommodate");
    expect(email.html).toContain("Email the parish office");
    expect(email.html).not.toContain("Approved");
    expect(email.text).toContain(`Phone: ${siteConfig.phones[0]}`);
  });

  it("escapes names in both versions of the HTML", () => {
    for (const status of ["approved", "rejected"] as const) {
      const email = massBookingStatusEmail({ ...bookingFields, full_name: hostile }, status);
      expect(email.html).not.toContain("<script>");
    }
  });
});

describe("baptismInquiryConfirmationEmail", () => {
  it("confirms the request with the preferred date", () => {
    const email = baptismInquiryConfirmationEmail({
      parent_name: "John & Grace Okafor",
      child_name: "Mary Okafor",
      preferred_date: "2026-08-02",
    });
    expect(email.subject).toBe("We've received your baptism request");
    expect(email.html).toContain("Dear John &amp; Grace Okafor,");
    expect(email.html).toContain("Mary Okafor");
    expect(email.html).toContain("Sunday, 2 August 2026");
    expect(email.text).toContain("Child: Mary Okafor");
    expect(email.text).toContain("Sunday, 2 August 2026");
    expectBrandedLayout(email.html);
    expectTextFooter(email.text);
  });

  it("leaves the date out when none was given", () => {
    const email = baptismInquiryConfirmationEmail({ parent_name: "Grace", child_name: "Mary", preferred_date: null });
    expect(email.html).not.toContain("Preferred");
    expect(email.text).not.toMatch(/Preferred/);
  });

  it("escapes names", () => {
    const email = baptismInquiryConfirmationEmail({ parent_name: hostile, child_name: hostile, preferred_date: null });
    expect(email.html).not.toContain("<script>");
  });
});

describe("baptismScheduledEmail", () => {
  const inquiry = scheduledInquiry();

  it("confirms the baptism and the practice with dates, times and places", () => {
    const email = baptismScheduledEmail(inquiry);
    expect(email.subject).toBe("Mary Ada Okafor's baptism is confirmed");
    expect(email.html).toContain("Your child&#39;s baptism is confirmed".replace("&#39;", "'"));
    expect(email.html).toContain("Sunday, 2 August 2026, 10:00 am");
    expect(email.html).toContain("Thursday, 30 July 2026, 5:30 pm");
    expect(email.html).toContain("Parish Hall");
    expect(email.html).toContain("Parents and godparents must attend the practice");
    expectBrandedLayout(email.html);
  });

  it("has a plain-text version listing both appointments", () => {
    const { text } = baptismScheduledEmail(inquiry);
    expect(text).toMatch(/BAPTISM\nSunday, 2 August 2026, 10:00 am\nSt\. Patrick's Catholic Church, Basorun/);
    expect(text).toMatch(/PRACTICE \(parents and godparents must attend\)\nThursday, 30 July 2026, 5:30 pm\nParish Hall/);
    expectTextFooter(text);
  });

  it("words a reschedule as updated dates", () => {
    const email = baptismScheduledEmail(inquiry, { rescheduled: true });
    expect(email.subject).toBe("Updated baptism dates for Mary Ada Okafor");
    expect(email.html).toContain("The baptism dates have changed");
    expect(email.html).toContain("Please use the new dates below.");
    expect(email.text).toContain("has updated the dates");
  });

  it("formats noon and midnight correctly", () => {
    const noon = baptismScheduledEmail({ ...inquiry, baptism_time: "12:00:00", practice_time: "00:15:00" });
    expect(noon.html).toContain("12:00 pm");
    expect(noon.html).toContain("12:15 am");
  });

  it("copes with missing times and places", () => {
    const email = baptismScheduledEmail({ ...inquiry, baptism_time: null, practice_place: null });
    expect(email.html).toContain("Sunday, 2 August 2026<");
    expect(email.text).not.toContain("null");
  });

  it("copes with missing dates", () => {
    const email = baptismScheduledEmail({ ...inquiry, baptism_date: null, practice_date: null });
    expect(email.html).not.toContain("Invalid Date");
  });

  it("escapes names and places", () => {
    const email = baptismScheduledEmail({ ...inquiry, parent_name: hostile, child_name: hostile, baptism_place: hostile });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain(escaped);
  });
});

describe("rsvpConfirmationEmail", () => {
  const event = { title: "Parish Feast Day", event_date: "2026-07-01", event_time: "10:00 AM", location: "Main Church" };

  it("confirms the RSVP with what, when and where", () => {
    const email = rsvpConfirmationEmail({ full_name: "Ada Obi", event });
    expect(email.subject).toBe("You're registered for Parish Feast Day");
    expect(email.html).toContain("Dear Ada,");
    expect(email.html).toContain("Parish Feast Day");
    expect(email.html).toContain("Wednesday, 1 July 2026");
    expect(email.html).toContain("10:00 AM");
    expect(email.html).toContain("Main Church");
    expect(email.html).toContain(`${siteConfig.siteUrl}/events`);
    expectBrandedLayout(email.html);
  });

  it("has a plain-text version", () => {
    const { text } = rsvpConfirmationEmail({ full_name: "Ada Obi", event });
    expect(text).toContain("Dear Ada,");
    expect(text).toContain("Event: Parish Feast Day\nDate: Wednesday, 1 July 2026\nTime: 10:00 AM\nVenue: Main Church");
    expectTextFooter(text);
  });

  it("leaves out a missing time and venue", () => {
    const email = rsvpConfirmationEmail({ full_name: "Ada", event: { ...event, event_time: null, location: null } });
    expect(email.html).not.toContain(">Time<");
    expect(email.html).not.toContain(">Venue<");
    expect(email.text).not.toMatch(/Time:|Venue:/);
  });

  it("greets by first name even with extra spaces", () => {
    expect(rsvpConfirmationEmail({ full_name: "  Ada   Obi ", event }).text).toContain("Dear Ada,");
  });

  it("escapes the guest's name and the event details", () => {
    const email = rsvpConfirmationEmail({ full_name: hostile, event: { ...event, title: hostile, location: hostile } });
    expect(email.html).not.toContain("<script>");
  });
});

describe("email logo", () => {
  it("is a real PNG", () => {
    const bytes = Buffer.from(EMAIL_LOGO_PNG_BASE64, "base64");
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  });

  it("has a stable content id", () => {
    expect(EMAIL_LOGO_CID).toBe("parish-logo");
  });
});
