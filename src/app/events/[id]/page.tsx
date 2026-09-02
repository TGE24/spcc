// Event detail page (PRD §5.8 — "Event details page" + "RSVP option").
// Linked from the /events listing's featured banner and grid cards.
// Photo gallery (Milestone 6) reads event_photos directly — RLS allows
// public select, so no safeQuery wrapper is needed for that one.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { ChurchEvent, EventPhoto } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { submitRsvp } from "./actions";
import { SubmitButton } from "@/components/submit-button";

function formatEventMeta(event: ChurchEvent) {
  const date = new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const parts = [date];
  if (event.event_time) parts.push(event.event_time);
  const meta = parts.join(" • ");
  return event.location ? `${meta} / Venue: ${event.location}` : meta;
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { id } = await params;
  const { success, error } = await searchParams;

  const supabase = await createClient();
  const [event, photos] = await Promise.all([
    safeQuery(supabase.from("events").select("*").eq("id", id).maybeSingle<ChurchEvent>()),
    safeQuery(
      supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: false })
        .returns<EventPhoto[]>()
    ),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <main className="flex-1">
      <section className="relative h-[360px] overflow-hidden md:h-[440px]">
        <PlaceholderImage
          slot={event.image_slot ?? `events/${event.id}`}
          label={event.title}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-[#212724]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">{event.title}</h1>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-brand-600">{formatEventMeta(event)}</p>
            {event.description && (
              <p className="mt-4 text-base text-gray-500 md:text-lg">{event.description}</p>
            )}
            <Link href="/events" className="mt-8 inline-block text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700 hover:underline">
              ← Back to all events
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900">RSVP</h2>
            <p className="mt-1 text-sm text-gray-500">Let us know you&rsquo;re coming.</p>

            {success && (
              <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
                You&rsquo;re on the list — see you there!
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
            )}

            <form action={submitRsvp} className="mt-4 space-y-3">
              <input type="hidden" name="event_id" value={event.id} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="full_name">
                  Your Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <SubmitButton
                pendingText="Submitting..."
                className="w-full rounded-3xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25"
              >
                RSVP
              </SubmitButton>
            </form>
          </div>
        </div>

        {photos && photos.length > 0 && (
          <div className="mx-auto mt-16 max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900">Photos</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.image_url}
                  alt={`${event.title} photo`}
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
