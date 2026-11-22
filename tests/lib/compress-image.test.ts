import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage } from "@/lib/compress-image";

const MB = 1024 * 1024;

type Encoded = { type: string; size: number } | null;

let bitmap: { width: number; height: number; close: ReturnType<typeof vi.fn> };
let encoder: (type: string, quality: number) => Encoded;
let drawImage: ReturnType<typeof vi.fn>;
let hasContext: boolean;
let canvases: HTMLCanvasElement[];

function file(name: string, type: string, size: number) {
  const f = new File(["x"], name, { type, lastModified: 1234 });
  Object.defineProperty(f, "size", { value: size });
  return f;
}

// Blob.size is read-only; give each fake blob its own size.
function sizedBlob(type: string, size: number) {
  const blob = new Blob(["y"], { type });
  Object.defineProperty(blob, "size", { value: size });
  return blob;
}

beforeEach(() => {
  bitmap = { width: 4000, height: 3000, close: vi.fn() };
  encoder = (type) => ({ type, size: 1 * MB });
  drawImage = vi.fn();
  hasContext = true;
  canvases = [];

  vi.stubGlobal("createImageBitmap", vi.fn(async () => bitmap));

  const realCreate = Document.prototype.createElement;
  vi.spyOn(document, "createElement").mockImplementation(((tag: string, opts?: ElementCreationOptions) => {
    const el = realCreate.call(document, tag, opts);
    if (tag === "canvas") {
      const canvas = el as HTMLCanvasElement;
      canvases.push(canvas);
      canvas.getContext = vi.fn(() => (hasContext ? { drawImage } : null)) as never;
      canvas.toBlob = ((cb: BlobCallback, type?: string, quality?: number) => {
        const out = encoder(type ?? "image/png", quality ?? 1);
        cb(out ? sizedBlob(out.type, out.size) : null);
      }) as never;
    }
    return el;
  }) as never);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("compressImage", () => {
  it("leaves GIFs alone so animation isn't lost", async () => {
    const gif = file("a.gif", "image/gif", 8 * MB);
    await expect(compressImage(gif)).resolves.toBe(gif);
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it("returns the original when the browser can't decode it", async () => {
    vi.mocked(createImageBitmap).mockRejectedValueOnce(new Error("decode"));
    const jpg = file("a.jpg", "image/jpeg", 8 * MB);
    await expect(compressImage(jpg)).resolves.toBe(jpg);
  });

  it("skips small images that are already within the size limit", async () => {
    bitmap.width = 1200;
    bitmap.height = 800;
    const jpg = file("small.jpg", "image/jpeg", 1 * MB);
    await expect(compressImage(jpg)).resolves.toBe(jpg);
    expect(bitmap.close).toHaveBeenCalled();
    expect(canvases).toHaveLength(0);
  });

  it("re-encodes a small-dimension image that is still large in bytes", async () => {
    bitmap.width = 1200;
    bitmap.height = 800;
    const jpg = file("heavy.jpg", "image/jpeg", 3 * MB);
    const out = await compressImage(jpg);
    expect(out).not.toBe(jpg);
    expect(canvases[0].width).toBe(1200);
  });

  it("scales the long edge down to 2560px, keeping the aspect ratio", async () => {
    const out = await compressImage(file("big.jpg", "image/jpeg", 8 * MB));
    expect(canvases[0].width).toBe(2560);
    expect(canvases[0].height).toBe(1920);
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 2560, 1920);
    expect(bitmap.close).toHaveBeenCalled();
    expect(out.type).toBe("image/webp");
    expect(out.name).toBe("big.webp");
    expect(out.lastModified).toBe(1234);
  });

  it("scales portrait images by their height", async () => {
    bitmap.width = 3000;
    bitmap.height = 6000;
    await compressImage(file("tall.png", "image/png", 9 * MB));
    expect(canvases[0].width).toBe(1280);
    expect(canvases[0].height).toBe(2560);
  });

  it("falls back to JPEG when the browser can't encode WebP", async () => {
    encoder = (type) => (type === "image/webp" ? { type: "image/png", size: 7 * MB } : { type: "image/jpeg", size: 2 * MB });
    const out = await compressImage(file("photo.png", "image/png", 9 * MB));
    expect(out.type).toBe("image/jpeg");
    expect(out.name).toBe("photo.jpg");
  });

  it("stops at the first quality that fits under 4.5MB", async () => {
    const qualities: number[] = [];
    encoder = (type, quality) => {
      qualities.push(quality);
      return { type, size: 3 * MB };
    };
    await compressImage(file("huge.jpg", "image/jpeg", 12 * MB));
    expect(qualities).toEqual([0.85]);
  });

  it("lowers quality until the result fits under 4.5MB", async () => {
    const qualities: number[] = [];
    encoder = (type, quality) => {
      qualities.push(quality);
      return { type, size: quality > 0.7 ? 6 * MB : 4 * MB };
    };
    const original = file("huge.jpg", "image/jpeg", 12 * MB);
    const out = await compressImage(original);
    expect(qualities).toEqual([0.85, 0.75, 0.6]);
    expect(out).not.toBe(original);
    expect(out.type).toBe("image/webp");
  });

  it("never returns something bigger than the original", async () => {
    encoder = (type) => ({ type, size: 9 * MB });
    const jpg = file("already-tight.jpg", "image/jpeg", 8 * MB);
    await expect(compressImage(jpg)).resolves.toBe(jpg);
  });

  it("returns the original when encoding produces nothing", async () => {
    encoder = () => null;
    const jpg = file("x.jpg", "image/jpeg", 8 * MB);
    await expect(compressImage(jpg)).resolves.toBe(jpg);
  });

  it("returns the original when there's no 2D context", async () => {
    hasContext = false;
    const jpg = file("x.jpg", "image/jpeg", 8 * MB);
    await expect(compressImage(jpg)).resolves.toBe(jpg);
    expect(bitmap.close).toHaveBeenCalled();
  });
});
