// Events — implemented from Figma node 22:13320 ("Event"). The design shows
// one featured event as a large banner card followed by a grid of the rest;
// we drive both from the same `events` query so there is one source of
// truth (admins manage events from /admin/events, not built yet).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { ChurchEvent } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { ArrowUpRightIcon } from "@/components/icons";


function formatEventMeta(event: ChurchEvent) {
  const date = new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
  const parts = [date];
  if (event.event_time) parts.push(event.event_time);
  const meta = parts.join(" • ");
  return event.location ? `${meta} / Venue: ${event.location}` : meta;
}

export default async function EventsPage() {
  const supabase = await createClient();
  const events = await safeQuery(
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .returns<ChurchEvent[]>()
  );

  const [featured, ...rest] = events ?? [];

  return (
    <main className="flex-1">
      <section className="relative h-[400px] overflow-hidden md:h-[512px]">
        <PlaceholderImage slot="events/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#212724]/38" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[58%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Upcoming Church Event</h1>
        </div>
      </section>

      {!featured ? (
        <section className="px-6 py-20 text-center md:px-[100px]">
          <p className="text-lg text-gray-500">
            No events are posted yet — check back soon, or follow us on social media for updates.
          </p>
        </section>
      ) : (
        <>
          {/* Featured event — first upcoming */}
          <section className="px-6 pt-16 md:px-[100px]">
            <div className="mx-auto flex max-w-[1216px] flex-col gap-8">
              <PlaceholderImage
                slot={featured.image_slot ?? `events/${featured.id}`}
                label={featured.title}
                className="h-[280px] w-full rounded-lg md:h-[386px]"
              />
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-brand-600">{formatEventMeta(featured)}</p>
                <Link href={`/events/${featured.id}`} className="group flex items-start gap-4">
                  <h2 className="flex-1 text-2xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-brand-600 md:text-[30px] md:leading-[38px]">
                    {featured.title}
                  </h2>
                  <ArrowUpRightIcon className="mt-1 size-6 shrink-0 text-gray-900 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                </Link>
                {featured.description && (
                  <p className="text-base text-gray-500 md:text-lg">{featured.description}</p>
                )}
                <Link
                  href={`/events/${featured.id}`}
                  className="mt-1 inline-flex w-fit items-center rounded-2xl bg-brand-50 px-3 py-0.5 text-sm font-medium text-brand-600 transition-all duration-200 hover:bg-brand-600 hover:text-white active:scale-[0.97]"
                >
                  More Info &amp; RSVP
                </Link>
              </div>
            </div>
          </section>

          {/* Remaining events grid */}
          {rest.length > 0 && (
            <section className="px-6 py-16 md:px-[100px]">
              <div className="mx-auto grid max-w-[1216px] gap-8 md:grid-cols-2">
                {rest.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white pb-5"
                  >
                    <PlaceholderImage
                      slot={event.image_slot ?? `events/${event.id}`}
                      label={event.title}
                      className="h-[280px] w-full md:h-[300px]"
                    />
                    <div className="flex flex-1 flex-col justify-center gap-3 px-6 pt-8">
                      <p className="text-sm font-semibold text-brand-600">{formatEventMeta(event)}</p>
                      <Link href={`/events/${event.id}`} className="group flex items-start gap-4">
                        <h3 className="flex-1 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-brand-600 md:text-2xl">
                          {event.title}
                        </h3>
                        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand-600 md:text-base">
                          More Info
                          <ArrowUpRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </Link>
                      {event.description && (
                        <p className="text-sm text-gray-500 md:text-base">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="px-6 py-16 md:px-[100px]">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-10 text-center md:p-16">
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
