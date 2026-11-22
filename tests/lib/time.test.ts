import { describe, expect, it } from "vitest";
import { formatDayLong, formatTime } from "@/lib/time";

describe("formatTime", () => {
  it.each([
    ["06:30:00", "6:30 am"],
    ["07:00", "7:00 am"],
    ["09:05:00", "9:05 am"],
    ["12:00:00", "12:00 pm"],
    ["00:00:00", "12:00 am"],
    ["00:15", "12:15 am"],
    ["13:45:00", "1:45 pm"],
    ["18:00:00", "6:00 pm"],
    ["23:59:59", "11:59 pm"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });

  it("returns an empty string for a missing time", () => {
    expect(formatTime(null)).toBe("");
    expect(formatTime(undefined)).toBe("");
    expect(formatTime("")).toBe("");
  });

  it("leaves unrecognisable input as it is", () => {
    expect(formatTime("evening")).toBe("evening");
  });
});

describe("formatDayLong", () => {
  it("formats a date in full, British style", () => {
    expect(formatDayLong("2026-12-25")).toBe("Friday, 25 December 2026");
  });

  it("doesn't slip a day at the start of a month", () => {
    expect(formatDayLong("2026-03-01")).toBe("Sunday, 1 March 2026");
  });
});
