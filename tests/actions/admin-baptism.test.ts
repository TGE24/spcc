import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { scheduleBaptism, updateInquiryStatus } from "@/app/admin/baptism-inquiries/actions";
import { addAmendment, addBaptismRecord } from "@/app/admin/baptism-records/actions";
import { supabase } from "../helpers/supabase";
import { errorParam, form, redirectTarget } from "../helpers/next";
import { scheduledInquiry } from "../helpers/fixtures";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => true) }));
const { sendEmail } = await import("@/lib/email");

beforeEach(() => {
  vi.mocked(sendEmail).mockClear();
});

describe("updateInquiryStatus", () => {
  it.each(["pending", "contacted", "closed"] as const)("sets the status to %s and sends no email", async (status) => {
    const db = supabase();
    await updateInquiryStatus("inq-1", status);
    const [call] = db.callsTo("baptism_inquiries", "update");
    expect(call.payload).toEqual({ status });
    expect(call.filters).toContainEqual(["eq", ["id", "inq-1"]]);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/baptism-inquiries");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/baptism-inquiries/inq-1");
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("scheduleBaptism", () => {
  const fields = {
    baptism_date: "2026-08-02",
    baptism_time: "10:00",
    baptism_place: " St. Patrick's ",
    practice_date: "2026-07-30",
    practice_time: "17:30",
    practice_place: "Parish Hall",
  };

  it("saves both appointments, marks it scheduled and emails the family", async () => {
    const saved = scheduledInquiry();
    const db = supabase()
      .respond("baptism_inquiries", "select", { data: { baptism_date: null } })
      .respond("baptism_inquiries", "update", { data: saved });

    const url = await redirectTarget(scheduleBaptism("inq-1", form(fields)));

    const [update] = db.callsTo("baptism_inquiries", "update");
    expect(update.payload).toEqual({
      baptism_date: "2026-08-02",
      baptism_time: "10:00",
      baptism_place: "St. Patrick's",
      practice_date: "2026-07-30",
      practice_time: "17:30",
      practice_place: "Parish Hall",
      status: "scheduled",
      scheduled_at: "2026-06-15T12:00:00.000Z",
    });
    expect(update.filters).toContainEqual(["eq", ["id", "inq-1"]]);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: saved.email, subject: "Mary Ada Okafor's baptism is confirmed" }),
    );
    expect(url).toBe("/admin/baptism-inquiries/inq-1?saved=1");
  });

  it("saves, but tells staff, when the family's email fails", async () => {
    const db = supabase().respond("baptism_inquiries", "update", { data: scheduledInquiry() });
    vi.mocked(sendEmail).mockResolvedValueOnce(false);
    const url = await redirectTarget(scheduleBaptism("inq-1", form(fields)));
    expect(url).toBe("/admin/baptism-inquiries/inq-1?saved=1&email=failed");
    expect(db.callsTo("baptism_inquiries", "update")).toHaveLength(1);
  });

  it("words the email as a reschedule when dates were already set", async () => {
    supabase()
      .respond("baptism_inquiries", "select", { data: { baptism_date: "2026-07-26" } })
      .respond("baptism_inquiries", "update", { data: scheduledInquiry() });
    await redirectTarget(scheduleBaptism("inq-1", form(fields)));
    expect(vi.mocked(sendEmail).mock.calls[0][0].subject).toBe("Updated baptism dates for Mary Ada Okafor");
  });

  it.each([
    [{ baptism_date: "" }, "Set the baptism's date, time and place."],
    [{ baptism_time: "" }, "Set the baptism's date, time and place."],
    [{ baptism_place: "  " }, "Set the baptism's date, time and place."],
    [{ practice_date: "" }, "Set the practice's date, time and place."],
    [{ practice_time: "" }, "Set the practice's date, time and place."],
    [{ practice_place: "" }, "Set the practice's date, time and place."],
    [{ baptism_date: "2026-06-14", practice_date: "2026-06-10" }, "The baptism date can't be in the past."],
    [{ practice_date: "2026-08-02" }, "The practice has to be on a day before the baptism."],
    [{ practice_date: "2026-08-03" }, "The practice has to be on a day before the baptism."],
  ])("rejects %o without saving or emailing", async (override, message) => {
    const db = supabase();
    const url = await redirectTarget(scheduleBaptism("inq-1", form({ ...fields, ...override })));
    expect(url.startsWith("/admin/baptism-inquiries/inq-1?")).toBe(true);
    expect(errorParam(url)).toBe(message);
    expect(db.callsTo("baptism_inquiries", "update")).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("allows a baptism today with the practice yesterday", async () => {
    supabase().respond("baptism_inquiries", "update", { data: scheduledInquiry() });
    const url = await redirectTarget(
      scheduleBaptism("inq-1", form({ ...fields, baptism_date: "2026-06-15", practice_date: "2026-06-14" })),
    );
    expect(url).toBe("/admin/baptism-inquiries/inq-1?saved=1");
  });

  it("reports a database error (e.g. the practice-before-baptism constraint)", async () => {
    supabase().respond("baptism_inquiries", "update", { error: { message: "violates check constraint" } });
    const url = await redirectTarget(scheduleBaptism("inq-1", form(fields)));
    expect(errorParam(url)).toBe("Saving the schedule failed: violates check constraint");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reports a request that couldn't be found", async () => {
    const url = await redirectTarget(scheduleBaptism("missing", form(fields)));
    expect(errorParam(url)).toBe("Saving the schedule failed.");
  });
});

describe("addBaptismRecord", () => {
  const fields = {
    child_name: " Mary Ada Okafor ",
    parents_names: "John & Grace Okafor",
    date_of_birth: "2026-03-01",
    baptism_date: "2026-05-03",
    officiating_priest: "",
    godparents: "Peter & Ruth Eze",
  };

  it("saves the record against the signed-in staff member", async () => {
    const db = supabase().signedInAs("staff-9");
    const url = await redirectTarget(addBaptismRecord(form(fields)));

    expect(db.callsTo("baptism_records", "insert")[0].payload).toEqual({
      child_name: "Mary Ada Okafor",
      parents_names: "John & Grace Okafor",
      date_of_birth: "2026-03-01",
      baptism_date: "2026-05-03",
      officiating_priest: null,
      godparents: "Peter & Ruth Eze",
      created_by: "staff-9",
    });
    expect(db.callsTo("baptism_inquiries")).toHaveLength(0);
    expect(url).toBe(`/admin/baptism-records?added=${encodeURIComponent("Mary Ada Okafor")}`);
  });

  it("closes the request it was pre-filled from", async () => {
    const db = supabase();
    await redirectTarget(addBaptismRecord(form({ ...fields, inquiry_id: "inq-1" })));
    const [close] = db.callsTo("baptism_inquiries", "update");
    expect(close.payload).toEqual({ status: "closed" });
    expect(close.filters).toContainEqual(["eq", ["id", "inq-1"]]);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/baptism-inquiries/inq-1");
  });

  it("stores optional fields as null", async () => {
    const db = supabase();
    await redirectTarget(addBaptismRecord(form({ ...fields, date_of_birth: "", godparents: "" })));
    expect(db.callsTo("baptism_records", "insert")[0].payload).toMatchObject({ date_of_birth: null, godparents: null });
  });

  it.each([{ child_name: "" }, { parents_names: " " }, { baptism_date: "" }])("requires the essentials (%o)", async (override) => {
    const db = supabase();
    const url = await redirectTarget(addBaptismRecord(form({ ...fields, ...override })));
    expect(errorParam(url)).toBe("Child's name, parents' names and baptism date are required.");
    expect(db.callsTo("baptism_records")).toHaveLength(0);
  });

  it("rejects a birth date after the baptism", async () => {
    const url = await redirectTarget(addBaptismRecord(form({ ...fields, date_of_birth: "2026-05-04" })));
    expect(errorParam(url)).toBe("The date of birth can't be after the baptism date.");
  });

  it("returns to the pre-filled form on failure", async () => {
    supabase().respond("baptism_records", "insert", { error: { message: "x" } });
    const url = await redirectTarget(addBaptismRecord(form({ ...fields, inquiry_id: "inq 1" })));
    expect(url.startsWith("/admin/baptism-records?from=inq%201&error=")).toBe(true);
    expect(errorParam(url)).toBe("Couldn't save the record. Please try again.");
  });

  it("doesn't close the request when the record fails to save", async () => {
    const db = supabase().respond("baptism_records", "insert", { error: { message: "x" } });
    await redirectTarget(addBaptismRecord(form({ ...fields, inquiry_id: "inq-1" })));
    expect(db.callsTo("baptism_inquiries")).toHaveLength(0);
  });

  it("records a null author if the session has gone", async () => {
    const db = supabase().signedOut();
    await redirectTarget(addBaptismRecord(form(fields)));
    expect(db.callsTo("baptism_records", "insert")[0].payload).toMatchObject({ created_by: null });
  });
});

describe("addAmendment", () => {
  it("appends an amendment by the signed-in staff member, never editing the record", async () => {
    const db = supabase().signedInAs("staff-2");
    await addAmendment(form({ baptism_record_id: "rec-1", amendment_text: "Godmother's name is Ruth." }));
    expect(db.callsTo("baptism_record_amendments", "insert")[0].payload).toEqual({
      baptism_record_id: "rec-1",
      amendment_text: "Godmother's name is Ruth.",
      amended_by: "staff-2",
    });
    expect(db.callsTo("baptism_records")).toHaveLength(0);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/baptism-records");
  });
});
