// Admin actions that upload or delete images: events (cover photos), event
// galleries, hero slides and harvest photos.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { addEvent, deleteEvent, updateEvent } from "@/app/admin/events/actions";
import { addEventPhoto, deleteEventPhoto } from "@/app/admin/events/[id]/photos/actions";
import { addHeroSlide, deleteHeroSlide, moveHeroSlide, saveHeroDefaults } from "@/app/admin/hero/actions";
import { addHarvestPhoto, deleteHarvestPhoto, moveHarvestPhoto } from "@/app/admin/harvest-photos/actions";
import { supabase } from "../helpers/supabase";
import { errorParam, form, imageFile, redirectTarget } from "../helpers/next";

vi.mock("@/lib/storage", () => ({
  uploadImage: vi.fn(async (_file: File, folder: string) => ({ ok: true, url: `https://cdn/${folder}/new.jpg` })),
  deleteImageByUrl: vi.fn(async () => {}),
}));
const { uploadImage, deleteImageByUrl } = await import("@/lib/storage");

beforeEach(() => {
  vi.mocked(uploadImage).mockClear();
  vi.mocked(deleteImageByUrl).mockClear();
});

const emptyFile = () => new File([], "", { type: "application/octet-stream" });

describe("addEvent", () => {
  const fields = {
    title: "  Harvest Mass  ",
    event_date: "2026-11-01",
    event_time: " 10:00 AM ",
    description: "",
    location: "Main Church",
    recap: "",
  };

  it("saves a trimmed event without a cover", async () => {
    const db = supabase();
    const url = await redirectTarget(addEvent(form({ ...fields, cover: emptyFile() })));
    expect(db.callsTo("events", "insert")[0].payload).toEqual({
      title: "Harvest Mass",
      description: null,
      event_date: "2026-11-01",
      event_time: "10:00 AM",
      location: "Main Church",
      recap: null,
      cover_image_url: null,
    });
    expect(uploadImage).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/events");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(url).toBe("/admin/events?saved=1");
  });

  it("uploads the cover first and saves its URL", async () => {
    const db = supabase();
    await redirectTarget(addEvent(form({ ...fields, cover: imageFile() })));
    expect(uploadImage).toHaveBeenCalledWith(expect.any(File), "events/covers");
    expect(db.callsTo("events", "insert")[0].payload).toMatchObject({ cover_image_url: "https://cdn/events/covers/new.jpg" });
  });

  it("needs a title and a date", async () => {
    const db = supabase();
    for (const override of [{ title: "  " }, { event_date: "" }]) {
      const url = await redirectTarget(addEvent(form({ ...fields, ...override })));
      expect(errorParam(url)).toBe("An event needs at least a title and a date.");
    }
    expect(db.callsTo("events")).toHaveLength(0);
  });

  it("stops when the cover upload is rejected", async () => {
    vi.mocked(uploadImage).mockResolvedValueOnce({ ok: false, error: "That image is too large — please keep it under 5MB." });
    const db = supabase();
    const url = await redirectTarget(addEvent(form({ ...fields, cover: imageFile() })));
    expect(errorParam(url)).toBe("That image is too large — please keep it under 5MB.");
    expect(db.callsTo("events")).toHaveLength(0);
  });

  it("removes the uploaded cover if the event fails to save", async () => {
    supabase().respond("events", "insert", { error: { message: "rls" } });
    const url = await redirectTarget(addEvent(form({ ...fields, cover: imageFile() })));
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/events/covers/new.jpg");
    expect(errorParam(url)).toBe("Saving the event failed: rls");
  });
});

describe("updateEvent", () => {
  const fields = { title: "Harvest Mass", event_date: "2026-11-01" };
  const existing = (cover: string | null) => ({ data: { cover_image_url: cover } });

  it("updates the fields and keeps the current cover", async () => {
    const db = supabase().respond("events", "select", existing("https://cdn/old.jpg"));
    const url = await redirectTarget(updateEvent("evt-1", form(fields)));
    const [update] = db.callsTo("events", "update");
    expect(update.payload).toMatchObject({ title: "Harvest Mass", cover_image_url: "https://cdn/old.jpg" });
    expect(update.filters).toContainEqual(["eq", ["id", "evt-1"]]);
    expect(deleteImageByUrl).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/events/evt-1");
    expect(url).toBe("/admin/events/evt-1?saved=1");
  });

  it("replaces the cover and only then deletes the old file", async () => {
    const db = supabase().respond("events", "select", existing("https://cdn/old.jpg"));
    await redirectTarget(updateEvent("evt-1", form({ ...fields, cover: imageFile() })));
    expect(db.callsTo("events", "update")[0].payload).toMatchObject({ cover_image_url: "https://cdn/events/covers/new.jpg" });
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/old.jpg");
  });

  it("removes the cover when asked", async () => {
    const db = supabase().respond("events", "select", existing("https://cdn/old.jpg"));
    await redirectTarget(updateEvent("evt-1", form({ ...fields, remove_cover: "on" })));
    expect(db.callsTo("events", "update")[0].payload).toMatchObject({ cover_image_url: null });
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/old.jpg");
  });

  it("prefers a new upload over 'remove cover'", async () => {
    const db = supabase().respond("events", "select", existing(null));
    await redirectTarget(updateEvent("evt-1", form({ ...fields, remove_cover: "on", cover: imageFile() })));
    expect(db.callsTo("events", "update")[0].payload).toMatchObject({ cover_image_url: "https://cdn/events/covers/new.jpg" });
  });

  it("goes back to the list for an event that no longer exists", async () => {
    expect(await redirectTarget(updateEvent("gone", form(fields)))).toBe("/admin/events");
  });

  it("needs a title and a date", async () => {
    const url = await redirectTarget(updateEvent("evt-1", form({ ...fields, title: "" })));
    expect(url.startsWith("/admin/events/evt-1?")).toBe(true);
    expect(errorParam(url)).toBe("An event needs at least a title and a date.");
  });

  it("reports a rejected upload without saving", async () => {
    vi.mocked(uploadImage).mockResolvedValueOnce({ ok: false, error: "Upload failed — please try again." });
    const db = supabase().respond("events", "select", existing(null));
    const url = await redirectTarget(updateEvent("evt-1", form({ ...fields, cover: imageFile() })));
    expect(errorParam(url)).toBe("Upload failed — please try again.");
    expect(db.callsTo("events", "update")).toHaveLength(0);
  });

  it("keeps the old cover and deletes the new upload if saving fails", async () => {
    supabase()
      .respond("events", "select", existing("https://cdn/old.jpg"))
      .respond("events", "update", { error: { message: "boom" } });
    const url = await redirectTarget(updateEvent("evt-1", form({ ...fields, cover: imageFile() })));
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/events/covers/new.jpg");
    expect(deleteImageByUrl).not.toHaveBeenCalledWith("https://cdn/old.jpg");
    expect(errorParam(url)).toBe("Saving the event failed: boom");
  });
});

describe("deleteEvent", () => {
  it("deletes the event and cleans up its cover and gallery files", async () => {
    supabase()
      .respond("event_photos", "select", { data: [{ image_url: "https://cdn/p1.jpg" }, { image_url: "https://cdn/p2.jpg" }] })
      .respond("events", "delete", { data: { cover_image_url: "https://cdn/cover.jpg" } });
    await deleteEvent("evt-1");
    expect(vi.mocked(deleteImageByUrl).mock.calls.map((c) => c[0])).toEqual([
      "https://cdn/cover.jpg",
      "https://cdn/p1.jpg",
      "https://cdn/p2.jpg",
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/events");
  });

  it("skips a missing cover", async () => {
    supabase().respond("events", "delete", { data: { cover_image_url: null } });
    await deleteEvent("evt-1");
    expect(deleteImageByUrl).not.toHaveBeenCalled();
  });

  it("leaves files alone if the event wasn't deleted", async () => {
    supabase().respond("event_photos", "select", { data: [{ image_url: "https://cdn/p1.jpg" }] });
    await deleteEvent("evt-1");
    expect(deleteImageByUrl).not.toHaveBeenCalled();
  });
});

describe("addEventPhoto", () => {
  it("uploads into the event's folder and saves the photo", async () => {
    const db = supabase();
    await addEventPhoto(form({ event_id: "evt-1", image: imageFile() }));
    expect(uploadImage).toHaveBeenCalledWith(expect.any(File), "events/evt-1");
    expect(db.callsTo("event_photos", "insert")[0].payload).toEqual({
      event_id: "evt-1",
      image_url: "https://cdn/events/evt-1/new.jpg",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/events/evt-1");
  });

  it("asks for a photo when none was chosen", async () => {
    const url = await redirectTarget(addEventPhoto(form({ event_id: "evt-1", image: emptyFile() })));
    expect(errorParam(url)).toBe("Please choose a photo to upload.");
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("reports a rejected upload", async () => {
    vi.mocked(uploadImage).mockResolvedValueOnce({ ok: false, error: "Please upload a JPEG, PNG, WebP, or GIF image." });
    const url = await redirectTarget(addEventPhoto(form({ event_id: "evt-1", image: imageFile() })));
    expect(url.startsWith("/admin/events/evt-1/photos?")).toBe(true);
    expect(errorParam(url)).toBe("Please upload a JPEG, PNG, WebP, or GIF image.");
  });

  it("removes the orphaned upload when saving fails", async () => {
    supabase().respond("event_photos", "insert", { error: { message: "rls" } });
    const url = await redirectTarget(addEventPhoto(form({ event_id: "evt-1", image: imageFile() })));
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/events/evt-1/new.jpg");
    expect(errorParam(url)).toBe("Upload succeeded, but saving the photo failed: rls");
  });
});

describe("deleteEventPhoto", () => {
  it("deletes the row and then its file", async () => {
    const db = supabase().respond("event_photos", "delete", { data: { image_url: "https://cdn/p.jpg" } });
    await deleteEventPhoto("evt-1", "ph-1");
    expect(db.callsTo("event_photos", "delete")[0].filters).toContainEqual(["eq", ["id", "ph-1"]]);
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/p.jpg");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/events/evt-1/photos");
  });

  it("does nothing more if the photo was already gone", async () => {
    await deleteEventPhoto("evt-1", "ph-1");
    expect(deleteImageByUrl).not.toHaveBeenCalled();
  });
});

// Hero slides and harvest photos share the same upload / order / delete shape.
describe.each([
  {
    name: "hero slides",
    table: "hero_slides",
    folder: "hero",
    page: "/admin/hero",
    add: addHeroSlide,
    remove: deleteHeroSlide,
    move: moveHeroSlide,
    noun: "slide",
  },
  {
    name: "harvest photos",
    table: "harvest_photos",
    folder: "harvest",
    page: "/admin/harvest-photos",
    add: addHarvestPhoto,
    remove: deleteHarvestPhoto,
    move: moveHarvestPhoto,
    noun: "photo",
  },
])("$name", ({ table, folder, page, add, remove, move, noun }) => {
  it("appends after the current highest sort order", async () => {
    const db = supabase().respond(table, "select", { data: { sort_order: 4 } });
    await add(form({ image: imageFile(), heading: " Welcome ", subheading: "" }));
    expect(uploadImage).toHaveBeenCalledWith(expect.any(File), folder);
    expect(db.callsTo(table, "insert")[0].payload).toMatchObject({
      image_url: `https://cdn/${folder}/new.jpg`,
      sort_order: 5,
    });
    expect(revalidatePath).toHaveBeenCalledWith(page);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("starts at 0 when there are none yet", async () => {
    const db = supabase();
    await add(form({ image: imageFile() }));
    expect(db.callsTo(table, "insert")[0].payload).toMatchObject({ sort_order: 0 });
  });

  it("asks for an image when none was chosen", async () => {
    const url = await redirectTarget(add(form({ image: emptyFile() })));
    expect(errorParam(url)).toBe("Please choose an image to upload.");
  });

  it("asks for an image when the field is missing entirely", async () => {
    const url = await redirectTarget(add(form({})));
    expect(errorParam(url)).toBe("Please choose an image to upload.");
  });

  it("reports a rejected upload", async () => {
    vi.mocked(uploadImage).mockResolvedValueOnce({ ok: false, error: "Upload failed — please try again." });
    const url = await redirectTarget(add(form({ image: imageFile() })));
    expect(url.startsWith(`${page}?`)).toBe(true);
    expect(errorParam(url)).toBe("Upload failed — please try again.");
  });

  it("removes the orphaned upload when saving fails", async () => {
    supabase().respond(table, "insert", { error: { message: "rls" } });
    const url = await redirectTarget(add(form({ image: imageFile() })));
    expect(deleteImageByUrl).toHaveBeenCalledWith(`https://cdn/${folder}/new.jpg`);
    expect(errorParam(url)).toBe(`Upload succeeded, but saving the ${noun} failed: rls`);
  });

  it("deletes the row and then its file", async () => {
    supabase().respond(table, "delete", { data: { image_url: "https://cdn/x.jpg" } });
    await remove("id-1");
    expect(deleteImageByUrl).toHaveBeenCalledWith("https://cdn/x.jpg");
  });

  it("skips file cleanup when nothing was deleted", async () => {
    await remove("id-1");
    expect(deleteImageByUrl).not.toHaveBeenCalled();
  });

  const rows = [
    { id: "a", sort_order: 0 },
    { id: "b", sort_order: 1 },
    { id: "c", sort_order: 2 },
  ];

  it("moves an item up by swapping sort orders with the one above", async () => {
    const db = supabase().respond(table, "select", { data: rows });
    await move("b", "up");
    const updates = db.callsTo(table, "update").map((c) => [c.payload, c.filters[0][1]]);
    expect(updates).toEqual([
      [{ sort_order: 0 }, ["id", "b"]],
      [{ sort_order: 1 }, ["id", "a"]],
    ]);
  });

  it("moves an item down by swapping with the one below", async () => {
    const db = supabase().respond(table, "select", { data: rows });
    await move("b", "down");
    const updates = db.callsTo(table, "update").map((c) => [c.payload, c.filters[0][1]]);
    expect(updates).toEqual([
      [{ sort_order: 2 }, ["id", "b"]],
      [{ sort_order: 1 }, ["id", "c"]],
    ]);
  });

  it.each([
    ["the first item up", "a", "up"],
    ["the last item down", "c", "down"],
    ["an unknown item", "zzz", "up"],
  ] as const)("does nothing when moving %s", async (_label, id, direction) => {
    const db = supabase().respond(table, "select", { data: rows });
    await move(id, direction);
    expect(db.callsTo(table, "update")).toHaveLength(0);
  });

  it("does nothing when the list can't be read", async () => {
    const db = supabase();
    await move("a", "down");
    expect(db.callsTo(table, "update")).toHaveLength(0);
  });
});

describe("addHeroSlide copy", () => {
  it("saves trimmed heading and subheading, blank as null", async () => {
    const db = supabase();
    await addHeroSlide(form({ image: imageFile(), heading: "  Welcome  ", subheading: "   " }));
    expect(db.callsTo("hero_slides", "insert")[0].payload).toMatchObject({ heading: "Welcome", subheading: null });
  });
});

describe("saveHeroDefaults", () => {
  it("updates the existing settings row", async () => {
    const db = supabase();
    const url = await redirectTarget(saveHeroDefaults(form({ id: "hs-1", heading: " Hi ", subheading: "" })));
    const [update] = db.callsTo("hero_settings", "update");
    expect(update.payload).toEqual({ heading: "Hi", subheading: null, updated_at: "2026-06-15T12:00:00.000Z" });
    expect(update.filters).toContainEqual(["eq", ["id", "hs-1"]]);
    expect(url).toBe("/admin/hero?saved=1");
  });

  it("creates the row the first time", async () => {
    const db = supabase();
    await redirectTarget(saveHeroDefaults(form({ heading: "Hi", subheading: "There" })));
    expect(db.callsTo("hero_settings", "insert")[0].payload).toEqual({ heading: "Hi", subheading: "There" });
  });

  it("reports a failed save", async () => {
    supabase().respond("hero_settings", "insert", { error: { message: "x" } });
    const url = await redirectTarget(saveHeroDefaults(form({ heading: "Hi" })));
    expect(errorParam(url)).toBe("Saving the default headline failed: x");
  });
});
