// Home / Landing page — implemented from Figma (fileKey RPQgtnHXvxcqMDTnPLohkb,
// node 2:2 "landing page"). Structure, copy, colors, type and spacing follow
// the design; photographic content uses placeholder blocks (see
// public/images/README.md) because this environment can't reach Figma's
// asset CDN to download the exact exported bytes — drop the real photos in
// and these render immediately, no code changes needed.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type {
	ChurchEvent,
	HarvestPhoto,
	HeroSlide,
	Homily,
	PriestMessage,
} from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon, BarChartIcon } from "@/components/icons";
import { PlaceholderImage } from "@/components/placeholder-image";
import { HeroSlider } from "@/components/hero-slider";
import { Reveal } from "@/components/reveal";
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
	] = await Promise.all([
		safeQuery(
			supabase
				.from("events")
				.select("*")
				.gte("event_date", new Date().toISOString().slice(0, 10))
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
				<HeroSlider slides={heroSlides} />
			) : (
				<section className="relative h-[80vh] min-h-125 overflow-hidden">
					<PlaceholderImage
						slot="home/hero"
						label="Hero photo"
						className="absolute inset-0 h-full w-full"
					/>
					<div className="absolute inset-0 bg-[#3a3535]/75" />
					<SiteHeader />
					<div className="absolute left-1/2 top-[45%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
						<h1 className="text-3xl font-bold md:text-5xl">
							Welcome to Our Parish Family
						</h1>
						<p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
							A place of worship, community, and spiritual growth. Join us in
							celebrating faith, love, and service.
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
					<Reveal className="mx-auto -mt-16 max-w-[1128px] md:-mt-24">
						<div className="rounded-3xl border-[10px] border-brand-700 bg-brand-600 px-6 py-12 text-center text-white shadow-lg md:px-16 md:py-16">
							<h2 className="mx-auto max-w-2xl text-2xl font-semibold md:text-4xl">
								{priestMessage?.heading?.trim() ||
									"A Message from the Parish Priest"}
							</h2>
							<div className="mx-auto mt-8 max-w-3xl space-y-6 text-base leading-relaxed md:text-xl">
								{priestMessageParagraphs.map((paragraph, i) => (
									<p key={i}>{paragraph}</p>
								))}
							</div>
						</div>
					</Reveal>
				</section>
			)}

			{/* Quick Features */}
			<section className="max-w-[1440px] mx-auto bg-gray-50 px-6 py-20 md:px-[100px]">
				<Reveal>
					<p className="text-sm font-semibold text-brand-600">Quick Features</p>
					<h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
						Access important church services quickly and easily.
					</h2>
				</Reveal>

				<div className="mt-12 grid gap-8 md:grid-cols-2">
					<Reveal delay={0}>
						<FeatureCard
							image="home/mass-intention"
							eyebrow="Mass"
							title="Book Mass Intention"
							cta="Book Now"
							href="/mass-booking"
							description="Request a Mass for thanksgiving, memorials, birthdays, or special intentions."
						/>
					</Reveal>
					<Reveal delay={120}>
						<FeatureCard
							image="home/baptism"
							eyebrow="Baptism"
							title="Book Baptism"
							cta="Get Started"
							href="/baptism-request"
							description="Register your child for baptism and receive guidance on the next steps."
						/>
					</Reveal>
				</div>
			</section>

			{/* Annual Harvest Celebration */}
			<section className="max-w-[1440px] mx-auto px-6 py-20 md:px-[100px]">
				<Reveal className="mx-auto max-w-3xl text-center">
					<h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
						Annual Harvest Celebration
					</h2>
					<p className="mt-5 text-lg text-gray-500 md:text-xl">
						Our annual harvest thanksgiving as we celebrate God&rsquo;s
						blessings and support the growth of our church.
					</p>
					<Link
						href="/harvest"
						className="mt-8 inline-block rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]"
					>
						Contribute to Harvest
					</Link>
				</Reveal>
				<div className="mx-auto mt-12 flex max-w-6xl flex-col gap-6 md:flex-row">
					<Reveal
						delay={0}
						className="min-w-0 flex-1 overflow-hidden rounded-3xl group"
					>
						{harvestPhotos?.[0] ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={harvestPhotos[0].image_url}
								alt="Harvest celebration"
								className="h-[280px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 md:h-[376px]"
							/>
						) : (
							<PlaceholderImage
								slot="home/harvest-1"
								label="Harvest photo"
								className="h-[280px] transition-transform duration-500 ease-out group-hover:scale-105 md:h-[376px]"
							/>
						)}
					</Reveal>
					<Reveal
						delay={120}
						className="min-w-0 flex-1 overflow-hidden rounded-3xl group"
					>
						{harvestPhotos?.[1] ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={harvestPhotos[1].image_url}
								alt="Harvest celebration"
								className="h-[280px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 md:h-[376px]"
							/>
						) : (
							<PlaceholderImage
								slot="home/harvest-2"
								label="Harvest photo"
								className="h-[280px] transition-transform duration-500 ease-out group-hover:scale-105 md:h-[376px]"
							/>
						)}
					</Reveal>
				</div>
			</section>

			{/* Upcoming Events — dynamic. Background photo drops in at
				public/images/home/upcoming-events.jpg (see public/images/README.md).
				Overlay/card/icon styling matches the Figma node (fileKey
				RPQgtnHXvxcqMDTnPLohkb, node 14:64) exactly: flat black/50 scrim (not
				a brand-tinted gradient), a warm translucent card, and green
				bar-chart icon bullets rather than the sparkle used elsewhere on this
				page. */}
			<section className="max-w-[1440px] mx-auto relative overflow-hidden bg-gray-900 px-6 py-20 md:px-[100px]">
				<PlaceholderImage
					slot="home/upcoming-events"
					label="Upcoming events photo"
					className="absolute inset-0 h-full w-full"
				/>
				<div className="absolute inset-0 bg-black/50" />
				<Reveal className="relative mx-auto max-w-3xl text-center text-white">
					<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
						Upcoming Events
					</h2>
					<p className="mt-5 text-lg md:text-xl">
						Stay connected and participate in our parish activities.
					</p>
				</Reveal>
				<Reveal
					delay={150}
					className="relative mx-auto mt-12 max-w-[1070px] rounded-3xl bg-[#695034]/50 px-6 py-10 md:px-14"
				>
					<div className="grid gap-8 md:grid-cols-3">
						{events && events.length > 0 ? (
							events.map((event) => (
								<div
									key={event.id}
									className="flex flex-col items-center gap-5 text-center text-white transition-transform duration-300 hover:-translate-y-1"
								>
									<span className="flex size-12 items-center justify-center rounded-full border-8 border-brand-700 bg-brand-50">
										<BarChartIcon className="size-6 text-brand-700" />
									</span>
									<div>
										<p className="text-xl font-medium">{event.title}</p>
										{event.description && (
											<p className="mt-1 text-base text-white/90">
												{event.description}
											</p>
										)}
									</div>
									<p className="text-base font-medium">
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
				</Reveal>
			</section>

			{/* Latest Sermons — recent homilies with a link through to /homilies
          for playback and filtering by priest/year. */}
			{homilies && homilies.length > 0 && (
				<section className="max-w-[1440px] mx-auto px-6 py-20 md:px-[100px]">
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

			{/* Newsletter / Community CTA */}
			<section className="max-w-[1440px] mx-auto bg-white px-6 pt-24 pb-0 md:px-[100px]">
				<Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-2xl bg-gray-50 p-10 text-center md:p-16">
					<div>
						<h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
							Be Part of Our Community
						</h2>
						<p className="mt-5 text-lg text-gray-500 md:text-xl">
							Join one of our church groups and grow in faith while building
							meaningful relationships.
						</p>
					</div>
					<Link
						href="/organizations"
						className="flex items-center gap-2 rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]"
					>
						Explore Organizations
						<ArrowRightIcon className="size-5" />
					</Link>
				</Reveal>
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
		<div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
			<div className="overflow-hidden">
				<PlaceholderImage
					slot={image}
					label={title}
					className="h-[300px] w-full transition-transform duration-500 ease-out group-hover:scale-105 md:h-[380px]"
				/>
			</div>
			<div className="space-y-3 p-6">
				<p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
				<div className="flex items-start justify-between gap-4">
					<h3 className="text-xl font-semibold text-gray-900 md:text-2xl">
						{title}
					</h3>
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
