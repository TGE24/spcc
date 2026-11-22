// Past event detail page: cover photo, write-up (description + recap) and
// photo gallery, all managed from /admin/events. Only past events have one.
// Upcoming events RSVP from their card on /events, so an old link to an
// upcoming event redirects there instead of 404ing.
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { cache, type ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { ChurchEvent, EventPhoto } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { PastEventCard } from "@/components/event-cards";
import { ArrowRightIcon } from "@/components/icons";
import { eventCoverSrc, formatEventDateLong, isPastEvent, todayISODate } from "@/lib/events";

type EventWithPhotos = ChurchEvent & {
  event_photos: { image_url: string; created_at: string }[];
};

// Shared by generateMetadata and the page so the event is fetched once.
const getEvent = cache(async (id: string) => {
  const supabase = await createClient();
  return safeQuery(supabase.from("events").select("*").eq("id", id).maybeSingle<ChurchEvent>());
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event || !isPastEvent(event)) return { title: "Event not found" };

  const description = (event.recap || event.description)?.slice(0, 160) ?? formatEventDateLong(event);
  return {
    title: event.title,
    description,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: {
      title: event.title,
      description,
      images: event.cover_image_url ? [event.cover_image_url] : [siteConfig.ogImage],
    },
  };
}

export default async function PastEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [event, photos, others] = await Promise.all([
    getEvent(id),
    safeQuery(
      supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: true })
        .returns<EventPhoto[]>()
    ),
    safeQuery(
      supabase
        .from("events")
        .select("*, event_photos(image_url, created_at)")
        .lt("event_date", todayISODate())
        .neq("id", id)
        .order("event_date", { ascending: false })
        .limit(3)
        .returns<EventWithPhotos[]>()
    ),
  ]);

  if (!event) notFound();
  if (!isPastEvent(event)) redirect("/events#upcoming");

  const gallery = photos ?? [];
  const cover = eventCoverSrc(event, gallery.map((p) => p.image_url));
  const recapParagraphs = event.recap?.split("\n").map((p) => p.trim()).filter(Boolean) ?? [];

  return (
    <main className="flex-1">
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-brand-600">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_100%_0%,var(--color-brand-700)_0%,transparent_65%)]" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0b1f14]/85 via-[#0b1f14]/35 to-[#0b1f14]/20" />
        <SiteHeader />
        <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-14 pt-40 text-white md:px-[100px] md:pb-20">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl">{event.title}</h1>
          <p className="mt-5 text-base text-white/85 md:text-lg">
            {formatEventDateLong(event)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px] md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-20">
          <Reveal>
            <article className="max-w-[68ch]">
              {event.description && (
                <p className="text-xl leading-relaxed text-gray-900 md:text-2xl md:leading-relaxed">
                  {event.description}
                </p>
              )}
              {recapParagraphs.length > 0 && (
                <div className={`space-y-5 text-lg leading-relaxed text-gray-500 ${event.description ? "mt-8" : ""}`}>
                  {recapParagraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
              {!event.description && recapParagraphs.length === 0 && (
                <p className="text-lg text-gray-500">
                  {gallery.length > 0
                    ? "A few moments from the day are below."
                    : "Thank you to everyone who joined us."}
                </p>
              )}
              <Link
                href="/events#past"
                className="mt-10 inline-flex items-center gap-2 text-base font-medium text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
              >
                <ArrowRightIcon className="size-5 rotate-180" />
                All past events
              </Link>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <dl className="divide-y divide-gray-200 rounded-3xl border border-gray-200 px-6 lg:sticky lg:top-28">
              <Fact label="Date" value={formatEventDateLong(event)} />
              {event.event_time && <Fact label="Time" value={event.event_time} />}
              {event.location && <Fact label="Venue" value={event.location} />}
              {gallery.length > 0 && (
                <Fact
                  label="Photos"
                  value={
                    <a href="#photos" className="text-brand-600 underline-offset-4 hover:underline">
                      {gallery.length} photo{gallery.length === 1 ? "" : "s"}
                    </a>
                  }
                />
              )}
            </dl>
          </Reveal>
        </div>
      </section>

      {gallery.length > 0 && (
        <section id="photos" className="max-w-[1440px] mx-auto scroll-mt-24 px-6 pb-20 md:px-[100px]">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">Photos</h2>
          {/* First photo leads at double size; the rest fill a dense grid.
              Each opens full size in a new tab. */}
          <ul className="mt-8 grid auto-rows-[160px] grid-cols-2 gap-3 grid-flow-dense md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
            {gallery.map((photo, i) => (
              <li key={photo.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <a
                  href={photo.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full overflow-hidden rounded-2xl bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image_url}
                    alt={`${event.title}, photo ${i + 1} of ${gallery.length}`}
                    loading={i < 5 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others && others.length > 0 && (
        <section className="max-w-[1440px] mx-auto band px-6 py-20 md:px-[100px]">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">More past events</h2>
          <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <li key={other.id}>
                <PastEventCard
                  event={other}
                  coverSrc={eventCoverSrc(
                    other,
                    [...other.event_photos]
                      .sort((a, b) => a.created_at.localeCompare(b.created_at))
                      .map((p) => p.image_url)
                  )}
                  photoCount={other.event_photos.length}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="py-4">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-base font-medium text-gray-900">{value}</dd>
    </div>
  );
}
