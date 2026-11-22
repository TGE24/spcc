// Home / Landing page — implemented from Figma (fileKey RPQgtnHXvxcqMDTnPLohkb,
// node 2:2 "landing page"). Structure, copy, colors, type and spacing follow
// the design; photographic content uses placeholder blocks (see
// public/images/README.md) because this environment can't reach Figma's
// asset CDN to download the exact exported bytes — drop the real photos in
// and these render immediately, no code changes needed.
import { HeroContent, HeroScrim } from "@/components/hero-content";
import { PriestMessageCard } from "@/components/priest-message";
import { HarvestFeature } from "@/components/harvest-feature";
import { ParishServices } from "@/components/parish-services";
import { CommunityGroups } from "@/components/community-groups";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type {
	ChurchEvent,
	HarvestPhoto,
	HeroSettings,
	HeroSlide,
	Homily,
	Organization,
	PriestMessage,
} from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { PlaceholderImage } from "@/components/placeholder-image";
import { HeroSlider } from "@/components/hero-slider";
import { Reveal } from "@/components/reveal";
import { UpcomingEventCard } from "@/components/event-cards";
import { resolveHeroDefaults } from "@/lib/hero";
import { todayISODate } from "@/lib/events";
import type { Announcement } from "@/types/database";

export default async function HomePage() {
	const supabase = await createClient();
	const now = new Date().toISOString();
	const [
		events,
		announcements,
		homilies,
		heroSlides,
		priestMessage,
		harvestPhotos,
		heroSettings,
		organizations,
	] = await Promise.all([
		safeQuery(
			supabase
				.from("events")
				.select("*")
				.gte("event_date", todayISODate())
				.order("event_date", { ascending: true })
				.limit(3)
				.returns<ChurchEvent[]>(),
		),
		safeQuery(
			supabase
				.from("announcements")
				.select("*")
				.lte("active_from", now)
				.or(`active_to.is.null,active_to.gte.${now}`)
				.order("active_from", { ascending: false })
				.limit(1)
				.returns<Announcement[]>(),
		),
		// Latest Sermons — most recent homilies, linking through to the full
		// /homilies listing for playback and filtering by priest/year.
		safeQuery(
			supabase
				.from("homilies")
				.select("*")
				.order("date", { ascending: false })
				.limit(3)
				.returns<Homily[]>(),
		),
		// Hero Slider — managed from /admin/hero. Empty result falls back to
		// the static placeholder hero below, so the page never looks broken on
		// a fresh database.
		safeQuery(
			supabase
				.from("hero_slides")
				.select("*")
				.order("sort_order", { ascending: true })
				.returns<HeroSlide[]>(),
		),
		// Priest's Message (the green card below the hero) — managed from
		// /admin/priest-message. Unlike most content on this page, an empty
		// result means the section doesn't render at all (see below), not a
		// placeholder fallback.
		safeQuery(
			supabase
				.from("priest_message")
				.select("*")
				.limit(1)
				.maybeSingle<PriestMessage>(),
		),
		// Harvest Celebration photos — managed from /admin/harvest-photos. Only
		// the first two (by sort_order) are shown; an empty or short result
		// falls back to the static placeholder photos below.
		safeQuery(
			supabase
				.from("harvest_photos")
				.select("*")
				.order("sort_order", { ascending: true })
				.returns<HarvestPhoto[]>(),
		),
		// Default hero headline/subtext — set in /admin/hero; used by any
		// slide without its own copy, and by the placeholder hero below.
		safeQuery(
			supabase
				.from("hero_settings")
				.select("*")
				.limit(1)
				.maybeSingle<HeroSettings>(),
		),
		// Be Part of Our Community — the parish's groups, managed from
		// /admin/organizations. Empty falls back to a named list in the
		// component.
		safeQuery(
			supabase
				.from("organizations")
				.select("id, name, meeting_schedule")
				.order("name")
				.returns<Pick<Organization, "id" | "name" | "meeting_schedule">[]>(),
		),
	]);
	const heroDefaults = resolveHeroDefaults(heroSettings);
	const announcement = announcements?.[0];
	const priestMessageParagraphs = priestMessage?.message?.trim()
		? priestMessage.message.split("\n").filter(Boolean)
		: null;

	return (
		<main className="flex-1">
			{/* Announcement banner (PRD §5.1) — only rendered while an admin has an
          active one set; otherwise the hero starts right at the top. */}
			{announcement && (
				<div className="max-w-360 mx-auto bg-brand-700 px-6 py-3 text-center text-sm text-white md:px-25">
					<span className="font-semibold">{announcement.title}</span>
					{announcement.body && (
						<span className="ml-2">{announcement.body}</span>
					)}
				</div>
			)}

			{/* Hero — /admin/hero controls this. Configured slides render through
          the client-side slider; with none set up yet, this falls back to
          the original static placeholder hero so the page still looks
          intentional on a fresh database. */}
			{heroSlides && heroSlides.length > 0 ? (
				<HeroSlider slides={heroSlides} defaults={heroDefaults} />
			) : (
				<section className="relative h-[80vh] min-h-125 overflow-hidden">
					<PlaceholderImage
						slot="home/hero"
						label="Hero photo"
						className="absolute inset-0 h-full w-full"
					/>
					<HeroScrim />
					<SiteHeader />
					<HeroContent
						heading={heroDefaults.heading}
						subheading={heroDefaults.subheading}
					/>
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
          this card's negative-margin overlap instead of sitting behind it.
          band-bleed supplies that positioning, plus the same full-width tint
          as the Upcoming Events band below, so the two read as one surface
          instead of a parchment strip with a seam under the card. */}
			{priestMessageParagraphs && (
				<section className="max-w-360 mx-auto band-bleed px-4 [--band-offset:4rem] md:px-0 md:[--band-offset:6rem]">
					<Reveal className="mx-auto -mt-16 max-w-282 md:-mt-24">
						<PriestMessageCard
							heading={
								priestMessage?.heading?.trim() ||
								"A Message from the Parish Priest"
							}
							paragraphs={priestMessageParagraphs}
						/>
					</Reveal>
				</section>
			)}

			{/* Upcoming Events — the next three events as typographic cards
				(src/components/event-cards.tsx), the soonest one filled green.
				RSVP opens in a dialog right on the card; past events and the full
				calendar live on /events. Below md the cards become a swipeable
				row that bleeds to the screen edge instead of a tall stack. */}
			<section className="max-w-360 mx-auto band py-20 md:px-25 md:py-24">
				<Reveal className="flex flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-0">
					<div className="max-w-2xl">
						<h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
							Upcoming Events
						</h2>
						<p className="mt-4 text-lg text-gray-500 md:text-xl">
							Stay connected and take part in parish life. Save your seat in a
							few seconds.
						</p>
					</div>
					<Link
						href="/events"
						className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-3xl border border-brand-600 px-6 py-3 text-base font-medium text-brand-600 transition-all duration-200 hover:bg-brand-600 hover:text-white active:scale-[0.97]"
					>
						All events
						<ArrowUpRightIcon className="size-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
					</Link>
				</Reveal>

				{events && events.length > 0 ? (
					<Reveal delay={120} className="mt-12">
						<ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 scrollbar-none md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
							{events.map((event, i) => (
								<li
									key={event.id}
									className="w-[85%] max-w-95 shrink-0 snap-start md:w-auto md:max-w-none"
								>
									<UpcomingEventCard event={event} featured={i === 0} />
								</li>
							))}
						</ul>
					</Reveal>
				) : (
					<Reveal delay={120} className="mx-6 mt-12 md:mx-0">
						<div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-gray-300 bg-white p-8 md:flex-row md:items-center md:justify-between md:p-10">
							<p className="text-lg text-gray-500">
								Nothing on the calendar just yet. New events are posted here
								first.
							</p>
							<Link
								href="/events#past"
								className="inline-flex shrink-0 items-center gap-2 text-base font-medium text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
							>
								Look back at past events
								<ArrowRightIcon className="size-5" />
							</Link>
						</div>
					</Reveal>
				)}
			</section>

			{/* Quick Features — the three requests parishioners can send the
				parish office online (components/parish-services.tsx). */}
			<ParishServices />

			{/* Annual Harvest Celebration — see components/harvest-feature.tsx. */}
			<HarvestFeature photos={harvestPhotos} />

			{/* Latest Sermons — recent homilies with a link through to /homilies
          for playback and filtering by priest/year. */}
			{homilies && homilies.length > 0 && (
				<section className="max-w-360 mx-auto px-6 py-20 md:px-25">
					<Reveal className="mx-auto max-w-3xl text-center">
						<h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
							Latest Sermons
						</h2>
						<p className="mt-5 text-lg text-gray-500 md:text-xl">
							Catch up on recent homilies from our priests.
						</p>
					</Reveal>
					<div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
						{homilies.map((homily, i) => (
							<Reveal
								key={homily.id}
								delay={i * 100}
								className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
							>
								<p className="text-xs font-semibold text-brand-600">
									{new Date(`${homily.date}T00:00:00`).toLocaleDateString(
										undefined,
										{
											month: "long",
											day: "numeric",
											year: "numeric",
										},
									)}
								</p>
								<h3 className="mt-2 text-lg font-semibold text-gray-900">
									{homily.title}
								</h3>
								{homily.priest_name && (
									<p className="mt-1 text-sm text-gray-500">
										{homily.priest_name}
									</p>
								)}
								<Link
									href="/homilies"
									className="mt-4 inline-block text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700 hover:underline"
								>
									Listen →
								</Link>
							</Reveal>
						))}
					</div>
				</section>
			)}

			{/* Be Part of Our Community — invitation beside the parish's real
				groups from /admin/organizations (components/community-groups.tsx). */}
			<CommunityGroups groups={organizations} />

			<SiteFooter />
		</main>
	);
}
