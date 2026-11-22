// Form fields shared by "Add an event" (/admin/events) and the edit page
// (/admin/events/[id]). The recap only shows publicly once the event is in
// the past, on its /events/[id] page — upcoming events have no detail page.
import type { ChurchEvent } from "@/types/database";
import { AdminFileInput, AdminInput, AdminLabel, AdminTextarea } from "@/components/admin/ui";

export function EventFields({ event }: { event?: ChurchEvent }) {
  return (
    <>
      <div>
        <AdminLabel htmlFor="title">Title</AdminLabel>
        <AdminInput id="title" name="title" required defaultValue={event?.title} />
      </div>
      <div>
        <AdminLabel htmlFor="description">Short description</AdminLabel>
        <AdminTextarea
          id="description"
          name="description"
          rows={2}
          defaultValue={event?.description ?? ""}
          placeholder="Shown on the event card, and as the intro once the event is past."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <AdminLabel htmlFor="event_date">Date</AdminLabel>
          <AdminInput id="event_date" name="event_date" type="date" required defaultValue={event?.event_date} />
        </div>
        <div>
          <AdminLabel htmlFor="event_time">Time</AdminLabel>
          <AdminInput id="event_time" name="event_time" placeholder="9:00 AM" defaultValue={event?.event_time ?? ""} />
        </div>
      </div>
      <div>
        <AdminLabel htmlFor="location">Venue / location</AdminLabel>
        <AdminInput id="location" name="location" defaultValue={event?.location ?? ""} />
      </div>
      <div>
        <AdminLabel htmlFor="cover">{event?.cover_image_url ? "Replace cover photo" : "Cover photo (optional)"}</AdminLabel>
        <AdminFileInput id="cover" name="cover" accept="image/jpeg,image/png,image/webp,image/gif" />
        <p className="mt-1.5 text-xs text-neutral-500">
          JPEG, PNG, WebP, or GIF (large photos are resized automatically). Without one, past events use their first gallery photo.
        </p>
      </div>
      <div>
        <AdminLabel htmlFor="recap">Write-up after the event (optional)</AdminLabel>
        <AdminTextarea
          id="recap"
          name="recap"
          rows={6}
          defaultValue={event?.recap ?? ""}
          placeholder={"How did it go? One paragraph per line.\nShown on the event's page once it's in the past."}
        />
      </div>
    </>
  );
}
