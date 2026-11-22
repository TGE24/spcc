// Global test setup: DOM matchers, a pinned clock, a fresh Supabase fake per
// test, and stand-ins for the Next.js and browser APIs jsdom doesn't have.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { createElement } from "react";
import { resetSupabase } from "./helpers/supabase";

// 2026-06-15, midday UTC. Every date in tests/helpers/fixtures.ts is
// relative to this.
export const NOW = new Date("2026-06-15T12:00:00Z");

beforeEach(() => {
  vi.setSystemTime(NOW);
  resetSupabase();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// ── Next.js ────────────────────────────────────────────────────────────────

vi.mock("next/navigation", async () => {
  const { RedirectError, NotFoundError } = await import("./helpers/next");
  return {
    redirect: vi.fn((url: string) => {
      throw new RedirectError(url);
    }),
    permanentRedirect: vi.fn((url: string) => {
      throw new RedirectError(url);
    }),
    notFound: vi.fn(() => {
      throw new NotFoundError();
    }),
    usePathname: vi.fn(() => "/"),
    useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() })),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => {
  const headerStore = new Headers();
  return {
    headers: vi.fn(async () => headerStore),
    cookies: vi.fn(async () => ({ getAll: () => [], set: vi.fn(), get: vi.fn() })),
  };
});

// next/image needs the image optimizer config; a plain <img> is enough to
// assert on src/alt in jsdom.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown> & { src: string; alt: string }) => {
    const rest = { ...props };
    for (const key of ["fill", "priority", "sizes", "quality", "placeholder"]) delete rest[key];
    return createElement("img", rest);
  },
}));

// Every server action, page and route reads through this; tests configure
// the fake via `supabase()` from tests/helpers/supabase.
vi.mock("@/lib/supabase/server", async () => {
  const helpers = await import("./helpers/supabase");
  return { createClient: vi.fn(async () => helpers.supabase()) };
});

// ── Browser APIs jsdom lacks ───────────────────────────────────────────────

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  elements: Element[] = [];
  constructor(public callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.elements.push(el);
  }
  unobserve() {}
  disconnect() {
    this.elements = [];
  }
  takeRecords() {
    return [];
  }
  /** Test hook: report every observed element as on screen. */
  trigger(isIntersecting = true) {
    this.callback(
      this.elements.map((target) => ({ target, isIntersecting }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    );
  }
}
// Assigned directly (not vi.stubGlobal) so a test's vi.unstubAllGlobals()
// can't remove it for the tests that follow.
globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
  }
}

if (typeof window !== "undefined") {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.print = vi.fn();
}
