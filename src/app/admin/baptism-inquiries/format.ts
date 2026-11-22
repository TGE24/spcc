// Shared display helpers for the baptism request list and detail pages.
import type { BaptismInquiry } from "@/types/database";

export const STATUS_TONE: Record<BaptismInquiry["status"], "warn" | "brand" | "success" | "neutral"> = {
  pending: "warn",
  contacted: "neutral",
  scheduled: "brand",
  closed: "success",
};

export function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export { formatTime } from "@/lib/time";
