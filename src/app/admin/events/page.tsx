// Admin: manage Events (PRD §5.8 admin features), including RSVP counts —
// RLS restricts reading event_rsvps to staff, so this is the only place
// those counts are visible.
// image_slot lets staff point an event at a photo exported into
// public/images/<slot>.jpg (see public/images/README.md) without a Storage
// upload pipeline for V1. "Manage photos" links to a per-event gallery of
// hosted-link photos, shown publicly on the event's detail page.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent, EventRsvp } from "@/types/database";
import { addEvent, deleteEvent } from "./actions";
import { ImageStackIcon } from "@/components/admin/nav-icons";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminTextarea,
} from "@/components/admin/ui";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const [{ data: events }, { data: rsvps }] = await Promise.all([
    supabase.from("events").select("*").order("event_date", { ascending: false }).returns<ChurchEvent[]>(),
    supabase.from("event_rsvps").select("*").returns<EventRsvp[]>(),
  ]);

  const rsvpCounts = new Map<string, number>();
  for (const rsvp of rsvps ?? []) {
    rsvpCounts.set(rsvp.event_id, (rsvpCounts.get(rsvp.event_id) ?? 0) + 1);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader title="Events" description="Parish events, RSVP counts, and photo galleries." />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add an event</h2>
        <form action={addEvent} className="mt-4 grid gap-4">
          <div>
            <AdminLabel htmlFor="title">Title</AdminLabel>
            <AdminInput id="title" name="title" required />
          </div>
          <div>
            <AdminLabel htmlFor="description">Description</AdminLabel>
            <AdminTextarea id="description" name="description" rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="event_date">Date</AdminLabel>
              <AdminInput id="event_date" name="event_date" type="date" required />
            </div>
            <div>
              <AdminLabel htmlFor="event_time">Time</AdminLabel>
              <AdminInput id="event_time" name="event_time" placeholder="9:00 AM" />
            </div>
          </div>
          <div>
            <AdminLabel htmlFor="location">Venue / location</AdminLabel>
            <AdminInput id="location" name="location" />
          </div>
          <div>
            <AdminLabel htmlFor="image_slot">Image slot (optional)</AdminLabel>
            <AdminInput id="image_slot" name="image_slot" placeholder="events/lenten-retreat" />
          </div>
          <div>
            <AdminButton type="submit">Add</AdminButton>
          </div>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {!events?.length ? (
          <AdminEmptyState>No events yet.</AdminEmptyState>
        ) : (
          events.map((event) => (
            <AdminCard key={event.id} className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-100">{event.title}</p>
                  <AdminBadge tone="brand">
                    {rsvpCounts.get(event.id) ?? 0} RSVP{(rsvpCounts.get(event.id) ?? 0) === 1 ? "" : "s"}
                  </AdminBadge>
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  {event.event_date}
                  {event.event_time ? ` · ${event.event_time}` : ""}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
                <Link
                  href={`/admin/events/${event.id}/photos`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
                >
                  <ImageStackIcon className="size-3.5" />
                  Manage photos
                </Link>
              </div>
              <form action={deleteEvent.bind(null, event.id)}>
                <AdminButton type="submit" variant="danger">
                  Delete
                </AdminButton>
              </form>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}
