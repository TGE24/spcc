import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  eventCoverSrc,
  eventDateParts,
  formatEventDateLong,
  isPastEvent,
  relativeDayLabel,
  todayISODate,
} from "@/lib/events";
import { event } from "../helpers/fixtures";

describe("todayISODate", () => {
  it("returns the current UTC date as YYYY-MM-DD", () => {
    expect(todayISODate()).toBe("2026-06-15");
  });

  it("uses the UTC day even late in the evening", () => {
    vi.setSystemTime(new Date("2026-06-15T23:59:59Z"));
    expect(todayISODate()).toBe("2026-06-15");
    vi.setSystemTime(new Date("2026-06-16T00:00:00Z"));
    expect(todayISODate()).toBe("2026-06-16");
  });
});

describe("isPastEvent", () => {
  it("treats yesterday as past", () => {
    expect(isPastEvent({ event_date: "2026-06-14" })).toBe(true);
  });

  it("treats today as still upcoming", () => {
    expect(isPastEvent({ event_date: "2026-06-15" })).toBe(false);
  });

  it("treats future dates as upcoming", () => {
    expect(isPastEvent({ event_date: "2027-01-01" })).toBe(false);
  });
});

describe("eventDateParts", () => {
  it("splits a date into month, day, weekday and year", () => {
    expect(eventDateParts({ event_date: "2026-07-01" })).toEqual({
      month: "Jul",
      day: 1,
      weekday: "Wed",
      year: 2026,
    });
  });

  it("does not slip a day at the start of the month", () => {
    expect(eventDateParts({ event_date: "2026-03-01" }).day).toBe(1);
  });
});

describe("formatEventDateLong", () => {
  it("formats the full date in US English", () => {
    expect(formatEventDateLong({ event_date: "2026-12-25" })).toBe("Friday, December 25, 2026");
  });
});

describe("eventCoverSrc", () => {
  it("prefers the uploaded cover", () => {
    expect(
      eventCoverSrc(event({ cover_image_url: "https://x/cover.jpg", image_slot: "home/baptism" }), [
        "https://x/photo.jpg",
      ]),
    ).toBe("https://x/cover.jpg");
  });

  it("falls back to the first gallery photo", () => {
    expect(eventCoverSrc(event(), ["https://x/1.jpg", "https://x/2.jpg"])).toBe("https://x/1.jpg");
  });

  it("falls back to a legacy image slot when the file exists", () => {
    // public/images/home/baptism.jpg ships with the site.
    expect(eventCoverSrc(event({ image_slot: "home/baptism" }))).toBe("/images/home/baptism.jpg");
  });

  it("ignores an image slot whose file is missing", () => {
    expect(eventCoverSrc(event({ image_slot: "does/not-exist" }))).toBeNull();
  });

  it("returns null with no cover, photos or slot", () => {
    expect(eventCoverSrc(event())).toBeNull();
  });

  it("only checks the filesystem when it has to", () => {
    const spy = vi.spyOn(fs, "existsSync");
    eventCoverSrc(event({ cover_image_url: "https://x/c.jpg", image_slot: "home/baptism" }));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("relativeDayLabel", () => {
  it.each([
    ["2026-06-10", "Today"],
    ["2026-06-15", "Today"],
    ["2026-06-16", "Tomorrow"],
    ["2026-06-17", "In 2 days"],
    ["2026-06-28", "In 13 days"],
    ["2026-06-29", "In 2 weeks"],
    ["2026-08-13", "In 8 weeks"],
    ["2026-08-14", "In 2 months"],
    ["2027-06-15", "In 12 months"],
  ])("labels %s as %s", (date, label) => {
    expect(relativeDayLabel({ event_date: date })).toBe(label);
  });
});
