import fs from "node:fs";
import path from "node:path";
import type { ChurchEvent } from "@/types/database";

// An event is "upcoming" through the end of its own day and "past" from the
// day after — the same UTC-date cutoff the Home page query has always used.
// Upcoming events RSVP from their card; only past events get a detail page
// (/events/[id]) with a recap and photos.
export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function isPastEvent(event: Pick<ChurchEvent, "event_date">) {
  return event.event_date < todayISODate();
}

// event_date is a plain `date` column — parse it at local midnight so the
// day never slips across a timezone boundary when formatted.
function eventDate(event: Pick<ChurchEvent, "event_date">) {
  return new Date(`${event.event_date}T00:00:00`);
}

export function eventDateParts(event: Pick<ChurchEvent, "event_date">) {
  const date = eventDate(event);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.getDate(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    year: date.getFullYear(),
  };
}

export function formatEventDateLong(event: Pick<ChurchEvent, "event_date">) {
  return eventDate(event).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Cover photo for an event card or detail page, most specific first: the
// uploaded cover, then the first gallery photo, then a legacy image_slot
// file in public/images. null means "no photo" — callers render a
// typographic fallback rather than a placeholder box on the public site.
export function eventCoverSrc(
  event: Pick<ChurchEvent, "cover_image_url" | "image_slot">,
  photoUrls: string[] = [],
): string | null {
  if (event.cover_image_url) return event.cover_image_url;
  if (photoUrls[0]) return photoUrls[0];
  if (event.image_slot) {
    const file = path.join(process.cwd(), "public", "images", `${event.image_slot}.jpg`);
    if (fs.existsSync(file)) return `/images/${event.image_slot}.jpg`;
  }
  return null;
}

// "Today" / "Tomorrow" / "In 5 days" — shown on upcoming cards in place of
// the tag line in the reference design. Whole UTC days, same cutoff as
// todayISODate, so it agrees with which section an event lands in.
export function relativeDayLabel(event: Pick<ChurchEvent, "event_date">) {
  const days = Math.round(
    (Date.parse(event.event_date) - Date.parse(todayISODate())) / 86_400_000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `In ${days} days`;
  if (days < 60) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}
