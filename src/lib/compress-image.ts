// Browser-side image shrinking for admin uploads (used by AdminFileInput).
// Phone/camera photos are routinely 5–15MB, over both the 5MB Storage limit
// (src/lib/storage.ts) and what a page actually needs. Resizing before the
// form is submitted keeps uploads fast and under the limit without asking
// staff to edit photos by hand.

// Long edge, in px. Comfortably sharp for a full-width hero on a retina
// laptop; anything bigger is wasted bytes.
const MAX_DIMENSION = 2560;
// Files at or below this size with dimensions in range are left untouched.
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024;
// Must stay under storage.ts's MAX_BYTES.
const TARGET_MAX_BYTES = 4.5 * 1024 * 1024;

const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a resized/re-encoded copy of `file`, or `file` itself when it's
 * already small enough, isn't a format we can safely re-encode (GIFs would
 * lose their animation), or the browser can't decode it.
 */
export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE.has(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    // Modern browsers apply EXIF orientation here, so portrait phone
    // photos don't come out sideways.
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps PNG transparency and compresses better than JPEG. Browsers
  // that can't encode WebP silently hand back a PNG instead, so fall back
  // to JPEG for those (only PNGs need alpha, and they're rarely photos).
  let blob: Blob | null = null;
  for (const quality of [0.85, 0.75, 0.6]) {
    blob = await encode(canvas, "image/webp", quality);
    if (blob && blob.type !== "image/webp") {
      blob = await encode(canvas, "image/jpeg", quality);
    }
    if (blob && blob.size <= TARGET_MAX_BYTES) break;
  }

  // Never hand back something bigger than what the user picked.
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type: blob.type, lastModified: file.lastModified });
}
