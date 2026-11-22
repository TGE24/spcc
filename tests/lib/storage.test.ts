import { describe, expect, it, vi } from "vitest";
import { deleteImageByUrl, uploadImage } from "@/lib/storage";
import { supabase } from "../helpers/supabase";
import { imageFile } from "../helpers/next";

const PUBLIC = "https://proj.supabase.co/storage/v1/object/public/site-images/";

describe("uploadImage", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/gif"])("accepts %s", async (type) => {
    const result = await uploadImage(imageFile("a.img", 10, type), "hero");
    expect(result.ok).toBe(true);
  });

  it("rejects other file types without touching storage", async () => {
    const result = await uploadImage(imageFile("doc.pdf", 10, "application/pdf"), "hero");
    expect(result).toEqual({ ok: false, error: "Please upload a JPEG, PNG, WebP, or GIF image." });
    expect(supabase().storage.from).not.toHaveBeenCalled();
  });

  it("rejects files over 5MB", async () => {
    const result = await uploadImage(imageFile("big.jpg", 5 * 1024 * 1024 + 1), "hero");
    expect(result).toEqual({ ok: false, error: "That image is too large — please keep it under 5MB." });
  });

  it("accepts a file of exactly 5MB", async () => {
    const result = await uploadImage(imageFile("max.jpg", 5 * 1024 * 1024), "hero");
    expect(result.ok).toBe(true);
  });

  it("uploads to the site-images bucket under the folder with a random name", async () => {
    const db = supabase();
    const result = await uploadImage(imageFile("Photo.JPG"), "events/evt-1");

    expect(db.storage.from).toHaveBeenCalledWith("site-images");
    const [path, , options] = db.storageBucket.upload.mock.calls[0] as unknown as [string, File, object];
    expect(path).toMatch(/^events\/evt-1\/[0-9a-f-]{36}\.jpg$/);
    expect(options).toEqual({ contentType: "image/jpeg", upsert: false });
    expect(result).toEqual({ ok: true, url: `${PUBLIC}${path}` });
  });

  it("takes the extension from the image type when the name has none", async () => {
    await uploadImage(imageFile("photo", 10, "image/png"), "hero");
    const [path] = supabase().storageBucket.upload.mock.calls[0] as unknown as [string];
    expect(path).toMatch(/^hero\/[0-9a-f-]{36}\.png$/);
  });

  it("ignores a leading dot when working out the extension", async () => {
    await uploadImage(imageFile(".hidden", 10, "image/webp"), "hero");
    const [path] = supabase().storageBucket.upload.mock.calls[0] as unknown as [string];
    expect(path).toMatch(/\.webp$/);
  });

  it("reports a storage failure", async () => {
    const db = supabase();
    db.storageBucket.upload.mockResolvedValueOnce({ data: null as never, error: { message: "denied" } });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(uploadImage(imageFile(), "hero")).resolves.toEqual({
      ok: false,
      error: "Upload failed — please try again.",
    });
  });
});

describe("deleteImageByUrl", () => {
  it("removes the object path from our bucket", async () => {
    const db = supabase();
    await deleteImageByUrl(`${PUBLIC}hero/abc.jpg`);
    expect(db.storageBucket.remove).toHaveBeenCalledWith(["hero/abc.jpg"]);
  });

  it("decodes URL-encoded paths", async () => {
    const db = supabase();
    await deleteImageByUrl(`${PUBLIC}events/my%20photo.jpg`);
    expect(db.storageBucket.remove).toHaveBeenCalledWith(["events/my photo.jpg"]);
  });

  it("ignores URLs that aren't in our bucket", async () => {
    const db = supabase();
    await deleteImageByUrl("https://example.com/images/old.jpg");
    expect(db.storage.from).not.toHaveBeenCalled();
  });

  it("logs, but doesn't throw, when removal fails", async () => {
    const db = supabase();
    db.storageBucket.remove.mockResolvedValueOnce({ data: null as never, error: { message: "nope" } });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(deleteImageByUrl(`${PUBLIC}hero/a.jpg`)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("Storage cleanup failed:", "nope");
  });
});
