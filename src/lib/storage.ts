// Image upload pipeline (supabase/migrations/0007_storage.sql). Every
// caller uploads through the signed-in staff member's own Supabase
// session — the same pattern as every other write in this app — so the
// bucket's RLS policies (staff-only insert/update/delete, public select)
// are what actually gate access, not this file.
import { createClient } from "@/lib/supabase/server";

const BUCKET = "site-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — matches the bucket's file_size_limit
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// A literal `ok` discriminant (rather than narrowing on the truthiness of
// `error`/`url` themselves) is what actually lets TS narrow this cleanly at
// every call site — `error?: string` on both branches would let a plain
// `if (result.error)` check narrow INTO the failure branch but not back
// OUT of it afterward, since TS can't rule out an empty-string `error` in
// the success branch without a real discriminant.
type UploadResult = { ok: true; url: string } | { ok: false; error: string };

// folder is a plain organizational prefix (e.g. "hero", "events/<id>") —
// not an RLS boundary. Every staff role that can write to this bucket can
// write to every folder in it, same as the DB tables it backs.
export async function uploadImage(file: File, folder: string): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Please upload a JPEG, PNG, WebP, or GIF image." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "That image is too large — please keep it under 5MB." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Storage upload failed:", error.message);
    return { ok: false, error: "Upload failed — please try again." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// Best-effort cleanup so deleting a hero slide/event photo doesn't leave
// an orphaned file in the bucket. Silently does nothing for a URL that
// isn't one of ours — e.g. any row from before this migration that still
// points at an external host — since there's nothing in our bucket to
// remove for those.
export async function deleteImageByUrl(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(url.slice(index + marker.length));
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("Storage cleanup failed:", error.message);
  }
}
