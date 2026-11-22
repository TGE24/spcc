// Admin: edit an event — details, cover photo and the post-event write-up.
// The gallery itself is managed on the neighbouring /photos page.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent } from "@/types/database";
import { isPastEvent } from "@/lib/events";
import { updateEvent } from "../actions";
import { EventFields } from "../event-fields";
import { ImageStackIcon } from "@/components/admin/nav-icons";
import { AdminAlert, AdminButton, AdminCard, AdminPageHeader } from "@/components/admin/ui";

export default async function AdminEditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle<ChurchEvent>();

  if (!event) {
    notFound();
  }
  const past = isPastEvent(event);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/admin/events" className="text-sm text-neutral-500 hover:text-neutral-300">
          ← Back to Events
        </Link>
        <AdminPageHeader
          title={`Edit ${event.title}`}
          description={
            past
              ? "This event is past. Its public page shows the cover photo, description, write-up and photo gallery."
              : "This event is upcoming, so it shows as a card with an RSVP button. Add a write-up and photos after it happens."
          }
        />
      </div>

      {error && <AdminAlert>{error}</AdminAlert>}
      {saved && <AdminAlert tone="success">Changes saved.</AdminAlert>}

      <AdminCard>
        <form action={updateEvent.bind(null, event.id)} className="grid gap-4">
          {event.cover_image_url && (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.cover_image_url}
                alt="Current cover"
                className="h-20 w-28 shrink-0 rounded-lg border border-white/10 object-cover"
              />
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input type="checkbox" name="remove_cover" className="size-4 accent-brand-600" />
                Remove cover photo
              </label>
            </div>
          )}
          <EventFields event={event} />
          <div className="flex flex-wrap items-center gap-4">
            <AdminButton type="submit">Save changes</AdminButton>
            <Link
              href={`/admin/events/${event.id}/photos`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
            >
              <ImageStackIcon className="size-4" />
              Manage photos
            </Link>
            {past && (
              <Link
                href={`/events/${event.id}`}
                target="_blank"
                className="text-sm text-neutral-400 hover:text-neutral-200 hover:underline"
              >
                View public page
              </Link>
            )}
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
