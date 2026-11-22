// Admin: manage Events (PRD §5.8 admin features), including RSVP counts —
// RLS restricts reading event_rsvps to staff, so this is the only place
// those counts are visible.
// Split into Upcoming and Past to match the public /events page: upcoming
// events take RSVPs from their card; past events get a public detail page
// built from the cover photo, write-up and photo gallery set here.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent, EventRsvp } from "@/types/database";
import { isPastEvent } from "@/lib/events";
import { addEvent, deleteEvent } from "./actions";
import { EventFields } from "./event-fields";
import { ImageStackIcon } from "@/components/admin/nav-icons";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminSectionLabel,
} from "@/components/admin/ui";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const [{ data: events }, { data: rsvps }, { data: photos }] = await Promise.all([
    supabase.from("events").select("*").order("event_date", { ascending: true }).returns<ChurchEvent[]>(),
    supabase.from("event_rsvps").select("event_id").returns<Pick<EventRsvp, "event_id">[]>(),
    supabase.from("event_photos").select("event_id").returns<{ event_id: string }[]>(),
  ]);

  const count = (rows: { event_id: string }[] | null) => {
    const counts = new Map<string, number>();
    for (const row of rows ?? []) counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
    return counts;
  };
  const rsvpCounts = count(rsvps);
  const photoCounts = count(photos);

  const upcoming = (events ?? []).filter((e) => !isPastEvent(e));
  const past = (events ?? []).filter(isPastEvent).reverse();

  const row = (event: ChurchEvent, isPast: boolean) => {
    const rsvpCount = rsvpCounts.get(event.id) ?? 0;
    const photoCount = photoCounts.get(event.id) ?? 0;
    return (
      <AdminCard key={event.id} className="flex items-start gap-4">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image_url} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-center text-[10px] leading-tight text-neutral-500">
            No cover
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-neutral-100">{event.title}</p>
            {isPast ? (
              <>
                <AdminBadge>{photoCount} photo{photoCount === 1 ? "" : "s"}</AdminBadge>
                {!event.recap && <AdminBadge tone="warn">No write-up</AdminBadge>}
              </>
            ) : (
              <AdminBadge tone="brand">
                {rsvpCount} RSVP{rsvpCount === 1 ? "" : "s"}
              </AdminBadge>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            {event.event_date}
            {event.event_time ? ` · ${event.event_time}` : ""}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
            <Link href={`/admin/events/${event.id}`} className="text-brand-700 hover:underline">
              Edit
            </Link>
            <Link
              href={`/admin/events/${event.id}/photos`}
              className="inline-flex items-center gap-1.5 text-brand-700 hover:underline"
            >
              <ImageStackIcon className="size-3.5" />
              Manage photos
            </Link>
            {isPast && (
              <Link href={`/events/${event.id}`} target="_blank" className="text-neutral-400 hover:text-neutral-200 hover:underline">
                View public page
              </Link>
            )}
          </div>
        </div>
        <form action={deleteEvent.bind(null, event.id)}>
          <AdminButton type="submit" variant="danger">
            Delete
          </AdminButton>
        </form>
      </AdminCard>
    );
  };

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader
        title="Events"
        description="Upcoming events take RSVPs on the public site. Once an event is past, it gets its own page with the cover photo, write-up and photo gallery."
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {saved && <AdminAlert tone="success">Event added.</AdminAlert>}

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add an event</h2>
        <form action={addEvent} className="mt-4 grid gap-4">
          <EventFields />
          <div>
            <AdminButton type="submit">Add</AdminButton>
          </div>
        </form>
      </AdminCard>

      <div>
        <AdminSectionLabel>
          Upcoming {upcoming.length > 0 && <AdminBadge tone="brand">{upcoming.length}</AdminBadge>}
        </AdminSectionLabel>
        <div className="space-y-3">
          {upcoming.length ? upcoming.map((e) => row(e, false)) : <AdminEmptyState>No upcoming events.</AdminEmptyState>}
        </div>
      </div>

      <div>
        <AdminSectionLabel>
          Past {past.length > 0 && <AdminBadge>{past.length}</AdminBadge>}
        </AdminSectionLabel>
        <div className="space-y-3">
          {past.length ? past.map((e) => row(e, true)) : <AdminEmptyState>No past events yet.</AdminEmptyState>}
        </div>
      </div>
    </div>
  );
}
