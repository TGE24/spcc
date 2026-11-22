// Every action reads form fields defensively (`formData.get(x) ?? ""`).
// These check what each one does when a field is missing entirely, as
// happens with a hand-crafted request rather than the site's own forms.
import { describe, expect, it, vi } from "vitest";
import { addAnnouncement } from "@/app/admin/announcements/actions";
import { saveHistory } from "@/app/admin/history/actions";
import { addHomily } from "@/app/admin/homilies/actions";
import { addMassTime } from "@/app/admin/mass-schedule/actions";
import { addOrganization } from "@/app/admin/organizations/actions";
import { savePriestMessage } from "@/app/admin/priest-message/actions";
import { addProject } from "@/app/admin/projects/actions";
import { addEvent } from "@/app/admin/events/actions";
import { saveHeroDefaults } from "@/app/admin/hero/actions";
import { submitMassBooking } from "@/app/mass-booking/actions";
import { submitHarvestPledge } from "@/app/harvest/actions";
import { submitBaptismInquiry } from "@/app/baptism-request/actions";
import { submitRsvp } from "@/app/events/actions";
import { scheduleBaptism } from "@/app/admin/baptism-inquiries/actions";
import { addBaptismRecord } from "@/app/admin/baptism-records/actions";
import { sendResetLink, signIn, updatePassword } from "@/app/login/actions";
import { supabase } from "../helpers/supabase";
import { errorParam, redirectTarget } from "../helpers/next";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));
vi.mock("@/lib/storage", () => ({ uploadImage: vi.fn(), deleteImageByUrl: vi.fn() }));

const empty = () => new FormData();

describe("admin content actions with no fields", () => {
  it("store optional fields as null rather than the text 'null'", async () => {
    const db = supabase();
    await addAnnouncement(empty());
    await saveHistory(empty());
    await addHomily(empty());
    await addMassTime(empty());
    await addOrganization(empty());
    await savePriestMessage(empty());
    await addProject(empty());

    expect(db.callsTo("announcements", "insert")[0].payload).toMatchObject({ body: null, active_to: null });
    expect(db.callsTo("parish_history", "insert")[0].payload).toEqual({ content: "", founding_date: null, founding_priest: null });
    expect(db.callsTo("homilies", "insert")[0].payload).toMatchObject({ priest_name: null, bible_reference: null });
    expect(db.callsTo("mass_schedule", "insert")[0].payload).toMatchObject({ label: null, special_date: null });
    expect(db.callsTo("organizations", "insert")[0].payload).toMatchObject({
      description: null,
      mission: null,
      meeting_schedule: null,
      leadership_contacts: null,
      how_to_join: null,
    });
    expect(db.callsTo("priest_message", "insert")[0].payload).toEqual({ heading: null, message: null });
    expect(db.callsTo("projects", "insert")[0].payload).toMatchObject({ description: null, budget_details: null, progress_update: null });
  });

  it("special Masses with no date or name store null", async () => {
    const db = supabase();
    const fd = new FormData();
    fd.set("day_type", "special");
    fd.set("time", "18:00");
    await addMassTime(fd);
    expect(db.callsTo("mass_schedule", "insert")[0].payload).toMatchObject({ special_date: null, special_name: null });
  });

  it("an event with no fields is rejected", async () => {
    expect(errorParam(await redirectTarget(addEvent(empty())))).toBe("An event needs at least a title and a date.");
  });

  it("hero defaults with no fields saves blanks", async () => {
    const db = supabase();
    await redirectTarget(saveHeroDefaults(empty()));
    expect(db.callsTo("hero_settings", "insert")[0].payload).toEqual({ heading: null, subheading: null });
  });
});

describe("public actions with no fields", () => {
  it("Mass booking saves empty strings and nulls (the database enforces required columns)", async () => {
    const db = supabase();
    await redirectTarget(submitMassBooking(empty()));
    expect(db.callsTo("mass_bookings", "insert")[0].payload).toEqual({
      full_name: "",
      email: "",
      phone: null,
      intention_type: "",
      preferred_date: "",
      message: null,
    });
  });

  it("harvest pledge defaults the name to empty and category to family", async () => {
    const db = supabase();
    await redirectTarget(submitHarvestPledge(empty()));
    expect(db.callsTo("harvest_pledges", "insert")[0].payload).toEqual({ pledger_name: "", category: "family", pledge_details: null });
  });

  it("baptism request is rejected before saving", async () => {
    const db = supabase();
    expect(errorParam(await redirectTarget(submitBaptismInquiry(empty())))).toBe(
      "Please enter the child's family name and baptismal name.",
    );
    expect(db.calls).toHaveLength(0);
  });

  it("RSVP asks for a name and email", async () => {
    await expect(submitRsvp({ status: "idle" }, empty())).resolves.toMatchObject({ status: "error" });
  });
});

describe("staff actions with no fields", () => {
  it("scheduling is rejected", async () => {
    expect(errorParam(await redirectTarget(scheduleBaptism("i", empty())))).toBe("Set the baptism's date, time and place.");
  });

  it("adding a record is rejected", async () => {
    expect(errorParam(await redirectTarget(addBaptismRecord(empty())))).toBe(
      "Child's name, parents' names and baptism date are required.",
    );
  });

  it("sign-in passes empty credentials to Supabase, which rejects them", async () => {
    const db = supabase();
    db.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: "validation_failed", message: "missing email" } });
    expect(errorParam(await redirectTarget(signIn(empty())))).toBe("missing email");
    expect(db.auth.signInWithPassword).toHaveBeenCalledWith({ email: "", password: "" });
  });

  it("reset link needs an email", async () => {
    expect(errorParam(await redirectTarget(sendResetLink(empty())))).toBe("Enter your staff email address.");
  });

  it("new password needs at least 8 characters", async () => {
    expect(errorParam(await redirectTarget(updatePassword(empty())))).toBe("Use at least 8 characters.");
  });
});
