// Events: every event, split in two.
//
// - Upcoming (today onward, soonest first): typographic cards with an RSVP
//   dialog. Upcoming events have no detail page.
// - Past (newest first, grouped by year): photo-led poster cards linking to
//   /events/[id], which shows the recap and photo gallery.
//
// Cards are shared with the Home page (src/components/event-cards.tsx).
// Photos are embedded in the one query (event_photos → events FK) for each
// past event's cover fallback and photo count.
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { ChurchEvent } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { PastEventCard, UpcomingEventCard } from "@/components/event-cards";
import { eventCoverSrc, isPastEvent } from "@/lib/events";

type EventWithPhotos = ChurchEvent & {
  event_photos: { image_url: string; created_at: string }[];
};

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming retreats, feast celebrations, and youth programs at Saint Patrick Parish, plus photos and highlights from past events.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const supabase = await createClient();
  const events =
    (await safeQuery(
      supabase
        .from("events")
        .select("*, event_photos(image_url, created_at)")
        .order("event_date", { ascending: true })
        .returns<EventWithPhotos[]>()
    )) ?? [];

  const upcoming = events.filter((e) => !isPastEvent(e));
  const past = events.filter(isPastEvent).reverse();

  // Group past events by year, newest year first (past is already sorted
  // newest-first, so insertion order is the display order).
  const pastByYear = new Map<number, EventWithPhotos[]>();
  for (const event of past) {
    const year = Number(event.event_date.slice(0, 4));
    pastByYear.set(year, [...(pastByYear.get(year) ?? []), event]);
  }

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] overflow-hidden">
        <PlaceholderImage slot="events/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#212724]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[58%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Parish Events</h1>
          <p className="mx-auto mt-5 max-w-[560px] text-base md:text-lg">
            Join us for what&rsquo;s coming up, and look back on the moments we&rsquo;ve shared.
          </p>
          <nav aria-label="Event sections" className="mt-8 inline-flex rounded-full bg-white/15 p-1 backdrop-blur-md">
            <a href="#upcoming" className="rounded-full px-5 py-2 text-sm font-medium transition hover:bg-white hover:text-brand-600">
              Upcoming <span className="tabular-nums opacity-75">{upcoming.length}</span>
            </a>
            <a href="#past" className="rounded-full px-5 py-2 text-sm font-medium transition hover:bg-white hover:text-brand-600">
              Past <span className="tabular-nums opacity-75">{past.length}</span>
            </a>
          </nav>
        </div>
      </section>

      {/* Upcoming */}
      <section id="upcoming" className="max-w-[1440px] mx-auto scroll-mt-24 px-6 py-20 md:px-[100px]">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">Coming Up</h2>
          <p className="mt-4 text-lg text-gray-500 md:text-xl">
            Everyone is welcome. RSVP so we can prepare to receive you.
          </p>
        </Reveal>

        {upcoming.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <li key={event.id} className="h-full">
                <Reveal delay={Math.min(i, 5) * 80} className="h-full">
                  <UpcomingEventCard event={event} featured={i === 0} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 rounded-3xl border border-dashed border-gray-300 p-8 text-lg text-gray-500 md:p-10">
            Nothing on the calendar just yet. Check back soon, or follow us on social media for updates.
          </p>
        )}
      </section>

      {/* Past */}
      <section id="past" className="max-w-[1440px] mx-auto scroll-mt-24 band px-6 py-20 md:px-[100px]">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">Past Events</h2>
          <p className="mt-4 text-lg text-gray-500 md:text-xl">
            Photos and highlights from the gatherings that shaped our parish year.
          </p>
        </Reveal>

        {past.length > 0 ? (
          <div className="mt-12 space-y-16">
            {[...pastByYear].map(([year, yearEvents]) => (
              <div key={year}>
                {pastByYear.size > 1 && (
                  <div className="mb-8 flex items-center gap-5">
                    <h3 className="font-display text-4xl text-brand-600 tabular-nums">{year}</h3>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>
                )}
                <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {yearEvents.map((event, i) => (
                    <li key={event.id}>
                      <Reveal delay={Math.min(i, 5) * 80}>
                        <PastEventCard
                          event={event}
                          coverSrc={eventCoverSrc(
                            event,
                            [...event.event_photos]
                              .sort((a, b) => a.created_at.localeCompare(b.created_at))
                              .map((p) => p.image_url)
                          )}
                          photoCount={event.event_photos.length}
                        />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-lg text-gray-500">
            Once an event has taken place, its photos and highlights will appear here.
          </p>
        )}
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <Reveal className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-10 text-center md:p-16">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            You Are Always Welcome
          </h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-lg text-gray-500 md:text-xl">
            <p>
              Whether you are visiting for the first time or looking for a spiritual home, we
              invite you to join us in worship and fellowship.
            </p>
            <p>Come as you are, and be part of a community that cares, supports, and grows together in faith.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/about" className="rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]">
              Learn More About Our Programs
            </Link>
            <Link href="/mass-schedule" className="rounded-3xl border border-brand-600 px-7 py-5 text-lg text-brand-600 transition-all duration-200 hover:bg-brand-50 active:scale-[0.97]">
              View Mass Schedule
            </Link>
            <Link href="/organizations" className="rounded-3xl px-7 py-5 text-lg text-brand-600 transition-all duration-200 hover:bg-brand-50 active:scale-[0.97]">
              Join a Group
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
