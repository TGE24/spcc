// Stand-ins for Next.js control flow. Like the real `redirect()` and
// `notFound()`, these throw, so code after them never runs; tests assert on
// the thrown error instead.
import { expect } from "vitest";

export class RedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
  }
}

/** Awaits `promise`, expecting it to redirect, and returns the target URL. */
export async function redirectTarget(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof RedirectError) return error.url;
    throw error;
  }
  throw new Error("Expected a redirect, but the call finished without one.");
}

/** Decoded `error` query param from a redirect URL. */
export function errorParam(url: string) {
  return new URL(url, "http://x").searchParams.get("error");
}

export async function expectNotFound(promise: Promise<unknown>) {
  await expect(promise).rejects.toBeInstanceOf(NotFoundError);
}

/** FormData from a plain object; File values are appended as files. */
export function form(fields: Record<string, string | File | undefined>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) fd.append(key, value);
  }
  return fd;
}

export function imageFile(name = "photo.jpg", size = 1024, type = "image/jpeg") {
  return new File([new Uint8Array(size)], name, { type });
}
