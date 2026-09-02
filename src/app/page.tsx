// Home / Landing page — implemented from Figma (fileKey RPQgtnHXvxcqMDTnPLohkb,
// node 2:2 "landing page"). Structure, copy, colors, type and spacing follow
// the design; photographic content uses placeholder blocks (see
// public/images/README.md) because this environment can't reach Figma's
// asset CDN to download the exact exported bytes — drop the real photos in
// and these render immediately, no code changes needed.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { ChurchEvent, HeroSlide, Homily, PriestMessage } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon, SparkleIcon } from "@/components/icons";
import { PlaceholderImage } from "@/components/placeholder-image";
import { HeroSlider } from "@/components/hero-slider";
import type { Announcement } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [events, announcements, homilies, heroSlides, priestMessage] = await Promise.all([
    safeQuery(
      supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true })
        .limit(3)
        .returns<ChurchEvent[]>()
    ),
    safeQuery(
      supabase
        .from("announcements")
        .select("*")
        .lte("active_from", now)
        .or(`active_to.is.null,active_to.gte.${now}`)
        .order("active_from", { ascending: false })
        .limit(1)
        .returns<Announcement[]>()
    ),
    // Latest Sermons — most recent homilies, linking through to the full
    // /homilies listing for playback and filtering by priest/year.
    safeQuery(
      supabase.from("homilies").select("*").order("date", { ascending: false }).limit(3).returns<Homily[]>()
    ),
    // Hero Slider — managed from /admin/hero. Empty result falls back to
    // the static placeholder hero below, so the page never looks broken on
    // a fresh database.
    safeQuery(
      supabase.from("hero_slides").select("*").order("sort_order", { ascending: true }).returns<HeroSlide[]>()
    ),
    // Priest's Message (the green card below the hero) — managed from
    // /admin/priest-message. Unlike most content on this page, an empty
    // result means the section doesn't render at all (see below), not a
    // placeholder fallback.
    safeQuery(
      supabase.from("priest_message").select("*").limit(1).maybeSingle<PriestMessage>()
    ),
  ]);
  const announcement = announcements?.[0];
  const priestMessageParagraphs = priestMessage?.message?.trim()
    ? priestMessage.message.split("\n").filter(Boolean)
    : null;

  return (
    <main className="flex-1">
      {/* Announcement banner (PRD §5.1) — only rendered while an admin has an
          active one set; otherwise the hero starts right at the top. */}
      {announcement && (
        <div className="max-w-[1440px] mx-auto bg-brand-700 px-6 py-3 text-center text-sm text-white md:px-[100px]">
          <span className="font-semibold">{announcement.title}</span>
          {announcement.body && <span className="ml-2">{announcement.body}</span>}
        </div>
      )}

      {/* Hero — /admin/hero controls this. Configured slides render through
          the client-side slider; with none set up yet, this falls back to
          the original static placeholder hero so the page still looks
          intentional on a fresh database. */}
      {heroSlides && heroSlides.length > 0 ? (
        <HeroSlider slides={heroSlides} />
      ) : (
        <section className="relative h-[500px] overflow-hidden md:h-[763px]">
          <PlaceholderImage
            slot="home/hero"
            label="Hero photo"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-[#3a3535]/75" />
          <SiteHeader />
          <div className="absolute left-1/2 top-[45%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <h1 className="text-3xl font-bold md:text-5xl">Welcome to Our Parish Family</h1>
            <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
              A place of worship, community, and spiritual growth. Join us in celebrating
              faith, love, and service.
            </p>
          </div>
        </section>
      )}

      {/* Priest's Message — managed from /admin/priest-message (PriestMessage).
          Renders nothing at all when empty, unlike most content on this page,
          which falls back to placeholder copy — an admin taking this section
          down is a deliberate choice, not a database that hasn't been filled
          in yet. When it does render, `relative` is required here, not
          decorative: the Hero above is `position: relative`, so without this
          section also being positioned, CSS paints all positioned elements
          above static ones regardless of DOM order, and the Hero would cover
          this card's negative-margin overlap instead of sitting behind it. */}
      {priestMessageParagraphs && (
        <section className="max-w-[1440px] mx-auto relative px-4 md:px-0">
          <div className="mx-auto -mt-16 max-w-[1128px] rounded-3xl border-[10px] border-brand-700 bg-brand-600 px-6 py-12 text-center text-white shadow-lg md:-mt-24 md:px-16 md:py-16">
            <h2 className="mx-auto max-w-2xl text-2xl font-semibold md:text-4xl">
              {priestMessage?.heading?.trim() || "A Message from the Parish Priest"}
            </h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-6 text-base leading-relaxed md:text-xl">
              {priestMessageParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Features */}
      <section className="max-w-[1440px] mx-auto bg-gray-50 px-6 py-20 md:px-[100px]">
        <p className="text-sm font-semibold text-brand-600">Quick Features</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Access important church services quickly and easily.
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <FeatureCard
            image="home/mass-intention"
            eyebrow="Mass"
            title="Book Mass Intention"
            cta="Book Now"
            href="/mass-booking"
            description="Request a Mass for thanksgiving, memorials, birthdays, or special intentions."
          />
          <FeatureCard
            image="home/baptism"
            eyebrow="Baptism"
            title="Book Baptism"
            cta="Get Started"
            href="/baptism-request"
            description="Register your child for baptism and receive guidance on the next steps."
          />
        </div>
      </section>

      {/* Annual Harvest Celebration */}
      <section className="max-w-[1440px] mx-auto px-6 py-20 md:px-[100px]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Annual Harvest Celebration
          </h2>
          <p className="mt-5 text-lg text-gray-500 md:text-xl">
            Our annual harvest thanksgiving as we celebrate God&rsquo;s blessings and
            support the growth of our church.
          </p>
          <Link
            href="/harvest"
            className="mt-8 inline-block rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]"
          >
            Contribute to Harvest
          </Link>
        </div>
        <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-6 md:flex-row">
          <PlaceholderImage slot="home/harvest-1" label="Harvest photo" className="h-[280px] flex-1 rounded-3xl md:h-[376px]" />
          <PlaceholderImage slot="home/harvest-2" label="Harvest photo" className="h-[280px] flex-1 rounded-3xl md:h-[376px]" />
        </div>
      </section>

      {/* Upcoming Events — dynamic */}
      <section className="max-w-[1440px] mx-auto relative overflow-hidden bg-gray-900 px-6 py-20 md:px-[100px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/40 via-gray-900 to-gray-900" />
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Upcoming Events</h2>
          <p className="mt-5 text-lg md:text-xl">
            Stay connected and participate in our parish activities.
          </p>
        </div>
        <div className="relative mx-auto mt-12 max-w-5xl rounded-3xl bg-[#695034]/60 px-6 py-10 md:px-14">
          <div className="grid gap-10 md:grid-cols-3">
            {events && events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex flex-col items-center gap-4 text-center text-white">
                  <span className="flex size-12 items-center justify-center rounded-full border-4 border-brand-700 bg-brand-50">
                    <SparkleIcon className="size-5 text-brand-600" />
                  </span>
                  <div>
                    <p className="text-lg font-medium">{event.title}</p>
                    {event.description && (
                      <p className="mt-1 text-sm text-white/90">{event.description}</p>
                    )}
                  </div>
                  <p className="text-sm">
                    {new Date(event.event_date).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-white/70">
                No upcoming events posted yet — check back soon.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Latest Sermons — recent homilies with a link through to /homilies
          for playback and filtering by priest/year. */}
      {homilies && homilies.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 py-20 md:px-[100px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              Latest Sermons
            </h2>
            <p className="mt-5 text-lg text-gray-500 md:text-xl">
              Catch up on recent homilies from our priests.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {homilies.map((homily) => (
              <div key={homily.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold text-brand-600">
                  {new Date(`${homily.date}T00:00:00`).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{homily.title}</h3>
                {homily.priest_name && <p className="mt-1 text-sm text-gray-500">{homily.priest_name}</p>}
                <Link
                  href="/homilies"
                  className="mt-4 inline-block text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700 hover:underline"
                >
                  Listen →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter / Community CTA */}
      <section className="max-w-[1440px] mx-auto bg-white px-6 pt-24 pb-0 md:px-[100px]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-2xl bg-gray-50 p-10 text-center md:p-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              Be Part of Our Community
            </h2>
            <p className="mt-5 text-lg text-gray-500 md:text-xl">
              Join one of our church groups and grow in faith while building meaningful
              relationships.
            </p>
          </div>
          <Link
            href="/organizations"
            className="flex items-center gap-2 rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]"
          >
            Explore Organizations
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </section>

      <div className="pt-24">
        <SiteFooter />
      </div>
    </main>
  );
}

function FeatureCard({
  image,
  eyebrow,
  title,
  description,
  cta,
  href,
}: {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <PlaceholderImage slot={image} label={title} className="h-[300px] w-full md:h-[380px]" />
      <div className="space-y-3 p-6">
        <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-900 md:text-2xl">{title}</h3>
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700"
          >
            {cta}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
}
