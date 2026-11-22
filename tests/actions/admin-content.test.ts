// Admin content actions: announcements, parish history, homilies, Mass
// bookings, Mass schedule, organizations, priest's message, projects, roles.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { addAnnouncement, deleteAnnouncement } from "@/app/admin/announcements/actions";
import { saveHistory } from "@/app/admin/history/actions";
import { addHomily, deleteHomily } from "@/app/admin/homilies/actions";
import { updateBookingStatus } from "@/app/admin/mass-bookings/actions";
import { addMassTime, deleteMassTime } from "@/app/admin/mass-schedule/actions";
import { addOrganization, deleteOrganization } from "@/app/admin/organizations/actions";
import { savePriestMessage } from "@/app/admin/priest-message/actions";
import { addProject, deleteProject } from "@/app/admin/projects/actions";
import { updateUserRole } from "@/app/admin/users/actions";
import { supabase } from "../helpers/supabase";
import { form } from "../helpers/next";
import { booking } from "../helpers/fixtures";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));
const { sendEmail } = await import("@/lib/email");

beforeEach(() => {
  vi.mocked(sendEmail).mockClear();
});

function revalidated() {
  return vi.mocked(revalidatePath).mock.calls.map((c) => c[0]);
}

describe("announcements", () => {
  it("adds an announcement that runs to the end of its last day", async () => {
    const db = supabase();
    await addAnnouncement(form({ title: "Parish picnic", body: "Bring a dish", active_from: "2026-06-20", active_to: "2026-06-27" }));
    expect(db.callsTo("announcements", "insert")[0].payload).toEqual({
      title: "Parish picnic",
      body: "Bring a dish",
      active_from: "2026-06-20",
      active_to: "2026-06-27T23:59:59",
    });
    expect(revalidated()).toEqual(["/admin/announcements", "/"]);
  });

  it("starts now and runs indefinitely when no dates are given", async () => {
    const db = supabase();
    await addAnnouncement(form({ title: "Welcome", body: "", active_from: "", active_to: "" }));
    expect(db.callsTo("announcements", "insert")[0].payload).toEqual({
      title: "Welcome",
      body: null,
      active_from: "2026-06-15T12:00:00.000Z",
      active_to: null,
    });
  });

  it("deletes an announcement", async () => {
    const db = supabase();
    await deleteAnnouncement("ann-1");
    expect(db.callsTo("announcements", "delete")[0].filters).toContainEqual(["eq", ["id", "ann-1"]]);
    expect(revalidated()).toContain("/");
  });
});

describe("saveHistory", () => {
  it("updates the existing history row", async () => {
    const db = supabase();
    await saveHistory(form({ id: "h-1", content: "Founded in 1960.", founding_date: "1960-03-17", founding_priest: "" }));
    const [update] = db.callsTo("parish_history", "update");
    expect(update.payload).toEqual({
      content: "Founded in 1960.",
      founding_date: "1960-03-17",
      founding_priest: null,
      updated_at: "2026-06-15T12:00:00.000Z",
    });
    expect(update.filters).toContainEqual(["eq", ["id", "h-1"]]);
    expect(revalidated()).toEqual(["/admin/history", "/about"]);
  });

  it("creates the row the first time", async () => {
    const db = supabase();
    await saveHistory(form({ content: "Founded.", founding_date: "", founding_priest: "Fr. Kelly" }));
    expect(db.callsTo("parish_history", "insert")[0].payload).toEqual({
      content: "Founded.",
      founding_date: null,
      founding_priest: "Fr. Kelly",
    });
  });
});

describe("homilies", () => {
  it("adds a homily with optional fields as null", async () => {
    const db = supabase();
    await addHomily(form({ title: "Good Shepherd", date: "2026-05-10", priest_name: "", bible_reference: "", audio_url: "https://a/b.mp3" }));
    expect(db.callsTo("homilies", "insert")[0].payload).toEqual({
      title: "Good Shepherd",
      date: "2026-05-10",
      priest_name: null,
      bible_reference: null,
      audio_url: "https://a/b.mp3",
    });
    expect(revalidated()).toEqual(["/admin/homilies", "/homilies"]);
  });

  it("deletes a homily", async () => {
    const db = supabase();
    await deleteHomily("hom-1");
    expect(db.callsTo("homilies", "delete")[0].filters).toContainEqual(["eq", ["id", "hom-1"]]);
  });
});

describe("updateBookingStatus", () => {
  it.each(["approved", "rejected"] as const)("sets %s and emails the parishioner", async (status) => {
    const row = booking({ status });
    const db = supabase().respond("mass_bookings", "update", { data: row });
    await updateBookingStatus("bk-1", status);
    expect(db.callsTo("mass_bookings", "update")[0].payload).toEqual({ status });
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: row.email }));
    expect(revalidated()).toEqual(["/admin/mass-bookings"]);
  });

  it("sends the right wording for each decision", async () => {
    supabase().respond("mass_bookings", "update", { data: booking() });
    await updateBookingStatus("bk-1", "approved");
    await updateBookingStatus("bk-1", "rejected");
    expect(vi.mocked(sendEmail).mock.calls.map((c) => c[0].subject)).toEqual([
      "Your Mass intention request has been approved",
      "An update on your Mass intention request",
    ]);
  });

  it("sends no email when moving back to pending", async () => {
    supabase().respond("mass_bookings", "update", { data: booking() });
    await updateBookingStatus("bk-1", "pending");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends no email when the booking couldn't be updated", async () => {
    await updateBookingStatus("bk-1", "approved");
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("Mass schedule", () => {
  it("adds a regular Sunday Mass without special-day fields", async () => {
    const db = supabase();
    await addMassTime(form({ day_type: "sunday", time: "07:00", label: "First Mass", special_date: "2026-12-25", special_name: "Christmas" }));
    expect(db.callsTo("mass_schedule", "insert")[0].payload).toEqual({
      day_type: "sunday",
      time: "07:00",
      label: "First Mass",
      special_date: null,
      special_name: null,
    });
    expect(revalidated()).toEqual(["/admin/mass-schedule", "/mass-schedule", "/"]);
  });

  it("keeps the date and name for a special Mass", async () => {
    const db = supabase();
    await addMassTime(form({ day_type: "special", time: "00:00", label: "", special_date: "2026-12-25", special_name: "Christmas" }));
    expect(db.callsTo("mass_schedule", "insert")[0].payload).toEqual({
      day_type: "special",
      time: "00:00",
      label: null,
      special_date: "2026-12-25",
      special_name: "Christmas",
    });
  });

  it("stores blank special fields as null", async () => {
    const db = supabase();
    await addMassTime(form({ day_type: "special", time: "18:00", special_date: "", special_name: "" }));
    expect(db.callsTo("mass_schedule", "insert")[0].payload).toMatchObject({ special_date: null, special_name: null });
  });

  it("deletes a Mass time", async () => {
    const db = supabase();
    await deleteMassTime("ms-1");
    expect(db.callsTo("mass_schedule", "delete")[0].filters).toContainEqual(["eq", ["id", "ms-1"]]);
  });
});

describe("organizations", () => {
  it("adds a group with optional fields as null", async () => {
    const db = supabase();
    await addOrganization(form({ name: "CYON", description: "Youth", mission: "", meeting_schedule: "Sundays", leadership_contacts: "", how_to_join: "" }));
    expect(db.callsTo("organizations", "insert")[0].payload).toEqual({
      name: "CYON",
      description: "Youth",
      mission: null,
      meeting_schedule: "Sundays",
      leadership_contacts: null,
      how_to_join: null,
    });
    expect(revalidated()).toEqual(["/admin/organizations", "/organizations", "/about"]);
  });

  it("deletes a group", async () => {
    const db = supabase();
    await deleteOrganization("org-1");
    expect(db.callsTo("organizations", "delete")[0].filters).toContainEqual(["eq", ["id", "org-1"]]);
  });
});

describe("savePriestMessage", () => {
  it("updates the existing message", async () => {
    const db = supabase();
    await savePriestMessage(form({ id: "pm-1", heading: " A Message ", message: " Welcome all. " }));
    expect(db.callsTo("priest_message", "update")[0].payload).toEqual({
      heading: "A Message",
      message: "Welcome all.",
      updated_at: "2026-06-15T12:00:00.000Z",
    });
    expect(revalidated()).toEqual(["/admin/priest-message", "/"]);
  });

  it("creates the row the first time", async () => {
    const db = supabase();
    await savePriestMessage(form({ heading: "", message: "Welcome." }));
    expect(db.callsTo("priest_message", "insert")[0].payload).toEqual({ heading: null, message: "Welcome." });
  });

  it("saves blanks as null, which takes the section off the home page", async () => {
    const db = supabase();
    await savePriestMessage(form({ id: "pm-1", heading: "  ", message: "  " }));
    expect(db.callsTo("priest_message", "update")[0].payload).toMatchObject({ heading: null, message: null });
  });
});

describe("projects", () => {
  it("adds a project", async () => {
    const db = supabase();
    await addProject(form({ title: "New roof", description: "", budget_details: "₦2m", progress_update: "" }));
    expect(db.callsTo("projects", "insert")[0].payload).toEqual({
      title: "New roof",
      description: null,
      budget_details: "₦2m",
      progress_update: null,
    });
    expect(revalidated()).toEqual(["/admin/projects", "/projects"]);
  });

  it("deletes a project", async () => {
    const db = supabase();
    await deleteProject("p-1");
    expect(db.callsTo("projects", "delete")[0].filters).toContainEqual(["eq", ["id", "p-1"]]);
  });
});

describe("updateUserRole", () => {
  it("changes a staff member's role", async () => {
    const db = supabase();
    await updateUserRole("user-2", "church_staff");
    const [update] = db.callsTo("profiles", "update");
    expect(update.payload).toEqual({ role: "church_staff" });
    expect(update.filters).toContainEqual(["eq", ["id", "user-2"]]);
    expect(revalidated()).toEqual(["/admin/users"]);
  });
});
