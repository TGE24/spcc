import { describe, expect, it } from "vitest";
import { resolveHeroDefaults } from "@/lib/hero";

const FALLBACK_HEADING = "Welcome to Our Parish Family";

describe("resolveHeroDefaults", () => {
  it("uses the built-in copy when nothing is saved", () => {
    const copy = resolveHeroDefaults(null);
    expect(copy.heading).toBe(FALLBACK_HEADING);
    expect(copy.subheading).toMatch(/place of worship/);
  });

  it("uses the saved heading and subheading", () => {
    expect(
      resolveHeroDefaults({ id: "1", heading: "Welcome home", subheading: "All are welcome", updated_at: "" }),
    ).toEqual({ heading: "Welcome home", subheading: "All are welcome" });
  });

  it("trims saved copy", () => {
    expect(
      resolveHeroDefaults({ id: "1", heading: "  Hello  ", subheading: " There ", updated_at: "" }),
    ).toEqual({ heading: "Hello", subheading: "There" });
  });

  it("falls back per field when one is blank or whitespace", () => {
    const copy = resolveHeroDefaults({ id: "1", heading: "   ", subheading: "Custom", updated_at: "" });
    expect(copy).toEqual({ heading: FALLBACK_HEADING, subheading: "Custom" });

    const other = resolveHeroDefaults({ id: "1", heading: "Custom", subheading: null, updated_at: "" });
    expect(other.heading).toBe("Custom");
    expect(other.subheading).toMatch(/place of worship/);
  });
});
