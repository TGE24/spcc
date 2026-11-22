// Server actions behind the public forms: Mass booking, baptism request,
// harvest pledge and event RSVP.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { submitMassBooking } from "@/app/mass-booking/actions";
import { submitBaptismInquiry } from "@/app/baptism-request/actions";
import { submitHarvestPledge } from "@/app/harvest/actions";
import { submitRsvp } from "@/app/events/actions";
import { supabase } from "../helpers/supabase";
import { errorParam, form, redirectTarget } from "../helpers/next";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));
const { sendEmail } = await import("@/lib/email");

beforeEach(() => {
  vi.mocked(sendEmail).mockClear();
});

describe("submitMassBooking", () => {
  const fields = {
    full_name: "Ada Obi",
    email: "ada@example.com",
    phone: "",
    intention_type: "Thanksgiving",
    preferred_date: "2026-07-05",
    message: "",
  };

  it("saves the booking, emails a confirmation and shows success", async () => {
    const db = supabase();
    const url = await redirectTarget(submitMassBooking(form(fields)));

    expect(db.callsTo("mass_bookings", "insert")[0].payload).toEqual({
      full_name: "Ada Obi",
      email: "ada@example.com",
      phone: null,
      intention_type: "Thanksgiving",
      preferred_date: "2026-07-05",
      message: null,
    });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ada@example.com", subject: "We've received your Mass intention request" }),
    );
    expect(url).toBe("/mass-booking?success=1");
  });

  it("keeps the phone number and message when given", async () => {
    const db = supabase();
    await redirectTarget(submitMassBooking(form({ ...fields, phone: "0800", message: "For Mum" })));
    expect(db.callsTo("mass_bookings", "insert")[0].payload).toMatchObject({ phone: "0800", message: "For Mum" });
  });

  it("shows an error and sends no email when saving fails", async () => {
    supabase().respond("mass_bookings", "insert", { error: { message: "rls" } });
    const url = await redirectTarget(submitMassBooking(form(fields)));
    expect(errorParam(url)).toBe("Something went wrong — please try again.");
    expect(url.startsWith("/mass-booking?")).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("submitBaptismInquiry", () => {
  const fields = {
    family_name: " Okafor ",
    baptismal_name: "Mary",
    other_names: "Ada",
    child_date_of_birth: "2026-03-01",
    place_of_birth: "Adeoyo Hospital",
    town_of_origin: "Onitsha",
    address: "12 Basorun Road",
    father_name: "John Okafor",
    mother_name: "Grace Okafor",
    godfather_name: "",
    godmother_name: "Ruth Eze",
    email: "family@example.com",
    phone: "",
    preferred_date: "2026-08-02",
    message: "",
  };

  it("saves the particulars, composes the combined names and emails a confirmation", async () => {
    const db = supabase();
    const url = await redirectTarget(submitBaptismInquiry(form(fields)));

    expect(db.callsTo("baptism_inquiries", "insert")[0].payload).toEqual({
      family_name: "Okafor",
      baptismal_name: "Mary",
      other_names: "Ada",
      child_name: "Mary Ada Okafor",
      child_date_of_birth: "2026-03-01",
      place_of_birth: "Adeoyo Hospital",
      town_of_origin: "Onitsha",
      address: "12 Basorun Road",
      father_name: "John Okafor",
      mother_name: "Grace Okafor",
      parent_name: "John Okafor & Grace Okafor",
      godfather_name: null,
      godmother_name: "Ruth Eze",
      email: "family@example.com",
      phone: null,
      preferred_date: "2026-08-02",
      message: null,
    });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "family@example.com", subject: "We've received your baptism request" }),
    );
    expect(url).toBe("/baptism-request?success=1");
  });

  it("never lets the public form set a schedule or status", async () => {
    const db = supabase();
    await redirectTarget(
      submitBaptismInquiry(form({ ...fields, status: "scheduled", baptism_date: "2026-07-01" } as never)),
    );
    const payload = db.callsTo("baptism_inquiries", "insert")[0].payload as Record<string, unknown>;
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("baptism_date");
  });

  it("accepts a single parent", async () => {
    const db = supabase();
    await redirectTarget(submitBaptismInquiry(form({ ...fields, father_name: "" })));
    const payload = db.callsTo("baptism_inquiries", "insert")[0].payload as Record<string, unknown>;
    expect(payload.parent_name).toBe("Grace Okafor");
    expect(payload.father_name).toBeNull();
  });

  it("leaves other names out of the combined child name when blank", async () => {
    const db = supabase();
    await redirectTarget(submitBaptismInquiry(form({ ...fields, other_names: "  " })));
    expect((db.callsTo("baptism_inquiries", "insert")[0].payload as { child_name: string }).child_name).toBe(
      "Mary Okafor",
    );
  });

  it("allows no preferred date", async () => {
    const url = await redirectTarget(submitBaptismInquiry(form({ ...fields, preferred_date: "" })));
    expect(url).toBe("/baptism-request?success=1");
  });

  it.each([
    [{ family_name: "" }, "Please enter the child's family name and baptismal name."],
    [{ baptismal_name: "   " }, "Please enter the child's family name and baptismal name."],
    [{ child_date_of_birth: "" }, "Please enter the child's date and place of birth."],
    [{ place_of_birth: "" }, "Please enter the child's date and place of birth."],
    [{ address: "" }, "Please enter your address in Ibadan."],
    [{ father_name: "", mother_name: " " }, "Please enter at least one parent's name."],
    [{ email: "" }, "Please enter an email address so we can confirm the baptism date with you."],
    [{ child_date_of_birth: "2026-06-16" }, "The date of birth can't be in the future."],
    [{ preferred_date: "2026-06-14" }, "The preferred baptism date can't be in the past."],
  ])("rejects %o", async (override, message) => {
    const db = supabase();
    const url = await redirectTarget(submitBaptismInquiry(form({ ...fields, ...override })));
    expect(url.startsWith("/baptism-request?")).toBe(true);
    expect(errorParam(url)).toBe(message);
    expect(db.callsTo("baptism_inquiries", "insert")).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("accepts a child born today and a baptism requested for today", async () => {
    const url = await redirectTarget(
      submitBaptismInquiry(form({ ...fields, child_date_of_birth: "2026-06-15", preferred_date: "2026-06-15" })),
    );
    expect(url).toBe("/baptism-request?success=1");
  });

  it("shows an error and sends no email when saving fails", async () => {
    supabase().respond("baptism_inquiries", "insert", { error: { message: "rls" } });
    const url = await redirectTarget(submitBaptismInquiry(form(fields)));
    expect(errorParam(url)).toBe("Something went wrong. Please try again.");
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("submitHarvestPledge", () => {
  it("saves the pledge and shows success", async () => {
    const db = supabase();
    const url = await redirectTarget(
      submitHarvestPledge(form({ pledger_name: "Obi Family", category: "group", pledge_details: "2 bags of rice" })),
    );
    expect(db.callsTo("harvest_pledges", "insert")[0].payload).toEqual({
      pledger_name: "Obi Family",
      category: "group",
      pledge_details: "2 bags of rice",
    });
    expect(url).toBe("/harvest?success=1");
  });

  it("defaults the category to family and blank details to null", async () => {
    const db = supabase();
    await redirectTarget(submitHarvestPledge(form({ pledger_name: "Obi", pledge_details: "" })));
    expect(db.callsTo("harvest_pledges", "insert")[0].payload).toMatchObject({ category: "family", pledge_details: null });
  });

  it("shows an error when saving fails", async () => {
    supabase().respond("harvest_pledges", "insert", { error: { message: "x" } });
    const url = await redirectTarget(submitHarvestPledge(form({ pledger_name: "Obi" })));
    expect(errorParam(url)).toBe("Something went wrong — please try again.");
  });
});

describe("submitRsvp", () => {
  const idle = { status: "idle" as const };
  const fields = { event_id: "evt-1", full_name: "  Ada Obi  ", email: " ada@example.com " };

  it("saves the RSVP and greets the guest by first name", async () => {
    const db = supabase().respond("events", "select", { data: { event_date: "2026-07-01" } });
    await expect(submitRsvp(idle, form(fields))).resolves.toEqual({ status: "success", name: "Ada" });
    expect(db.callsTo("event_rsvps", "insert")[0].payload).toEqual({
      event_id: "evt-1",
      full_name: "Ada Obi",
      email: "ada@example.com",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
  });

  it("accepts RSVPs on the day of the event", async () => {
    supabase().respond("events", "select", { data: { event_date: "2026-06-15" } });
    await expect(submitRsvp(idle, form(fields))).resolves.toMatchObject({ status: "success" });
  });

  it("asks for a name and email", async () => {
    const db = supabase();
    await expect(submitRsvp(idle, form({ ...fields, full_name: " " }))).resolves.toEqual({
      status: "error",
      message: "Please add your name and email so we know who's coming.",
    });
    await expect(submitRsvp(idle, form({ ...fields, email: "" }))).resolves.toMatchObject({ status: "error" });
    expect(db.calls).toHaveLength(0);
  });

  it("reports an event that no longer exists", async () => {
    await expect(submitRsvp(idle, form(fields))).resolves.toEqual({
      status: "error",
      message: "We couldn't find this event — it may have been removed.",
    });
  });

  it("closes RSVPs once the event has passed", async () => {
    const db = supabase().respond("events", "select", { data: { event_date: "2026-06-14" } });
    await expect(submitRsvp(idle, form(fields))).resolves.toEqual({
      status: "error",
      message: "This event has already taken place, so RSVPs are closed.",
    });
    expect(db.callsTo("event_rsvps")).toHaveLength(0);
  });

  it("reports a failed save", async () => {
    supabase()
      .respond("events", "select", { data: { event_date: "2026-07-01" } })
      .respond("event_rsvps", "insert", { error: { message: "x" } });
    await expect(submitRsvp(idle, form(fields))).resolves.toEqual({
      status: "error",
      message: "Something went wrong saving your RSVP — please try again.",
    });
  });
});
