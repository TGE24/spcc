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

export function formatTime(time: string | null) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
