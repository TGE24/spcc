import { describe, expect, it } from "vitest";
import { safeQuery } from "@/lib/supabase/safe-query";

describe("safeQuery", () => {
  it("returns data from a successful query", async () => {
    await expect(safeQuery(Promise.resolve({ data: [1, 2], error: null }))).resolves.toEqual([1, 2]);
  });

  it("returns null when the query reports an error", async () => {
    await expect(safeQuery(Promise.resolve({ data: [1], error: { message: "denied" } }))).resolves.toBeNull();
  });

  it("returns null when the query throws (unreachable Supabase)", async () => {
    await expect(safeQuery(Promise.reject(new Error("fetch failed")))).resolves.toBeNull();
  });

  it("passes through null data", async () => {
    await expect(safeQuery(Promise.resolve({ data: null, error: null }))).resolves.toBeNull();
  });

  it("accepts any thenable, like a Supabase query builder", async () => {
    const thenable = {
      then: (resolve: (v: { data: string; error: null }) => void) => resolve({ data: "ok", error: null }),
    } as unknown as PromiseLike<{ data: string; error: null }>;
    await expect(safeQuery(thenable)).resolves.toBe("ok");
  });
});
