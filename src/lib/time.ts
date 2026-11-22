// Readable times and dates for the parish's own schedules. Postgres `time`
// columns come back as "06:30:00"; people read "6:30 am".

/** "06:30:00" → "6:30 am", "18:00" → "6:00 pm", null → "". */
export function formatTime(time: string | null | undefined) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** "2026-12-25" → "Friday, 25 December 2026". */
export function formatDayLong(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
