// Home page "Annual Harvest Celebration" feature. Previously a centred
// heading over two uncaptioned photos — nothing told a visitor what the
// pictures were or what "contribute" involved. Now a two-column layout:
// the copy explains what Harvest Thanksgiving is and how pledging works
// (three steps, mirroring the /harvest page: pledge → parish office
// follows up on payment → give thanks together), beside a captioned photo
// collage from /admin/harvest-photos that links to the full gallery.
import Link from "next/link";
import { PlaceholderImage } from "./placeholder-image";
import { Reveal } from "./reveal";
import type { HarvestPhoto } from "@/types/database";

const STEPS = [
	{
		title: "Make your pledge",
		body: "As a family, a group, or a society — it takes a minute online.",
	},
	{
		title: "We'll be in touch",
		body: "The parish office contacts you to arrange payment. Nothing is paid on the website.",
	},
	{
		title: "Give thanks together",
		body: "Bring your offering to our Harvest Thanksgiving celebration as one parish family.",
	},
];

function HarvestImage({
	photo,
	slot,
	className,
}: {
	photo?: HarvestPhoto;
	slot: string;
	className: string;
}) {
	return photo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={photo.image_url}
			alt="Parishioners at a past Harvest Thanksgiving celebration"
			className={`object-cover ${className}`}
		/>
	) : (
		<PlaceholderImage slot={slot} label="Harvest photo" className={className} />
	);
}

export function HarvestFeature({ photos }: { photos: HarvestPhoto[] | null }) {
	return (
		<section className="max-w-360 mx-auto px-6 py-20 md:px-25 md:py-24">
			<div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
				<Reveal>
					<p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-sp-gold-text">
						<span aria-hidden className="h-px w-8 bg-sp-gold" />
						Harvest &amp; Thanksgiving
					</p>
					<h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
						Annual Harvest Celebration
					</h2>
					<p className="mt-5 text-lg leading-relaxed text-gray-500">
						Each year our parish family gathers to thank God for the blessings
						of the year — and to give back toward the growth and upkeep of our
						church.
					</p>

					<ol className="mt-10 space-y-6">
						{STEPS.map((step, i) => (
							<li key={step.title} className="flex gap-5">
								<span
									aria-hidden
									className="flex size-11 shrink-0 items-center justify-center rounded-full border border-sp-gold/60 bg-white font-display text-lg font-bold text-sp-green"
								>
									{i + 1}
								</span>
								<div>
									<p className="font-semibold text-gray-900">{step.title}</p>
									<p className="mt-1 text-gray-500">{step.body}</p>
								</div>
							</li>
						))}
					</ol>

					<div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
						<Link
							href="/harvest#pledge"
							className="inline-block rounded-3xl bg-brand-600 px-7 py-4 text-base font-medium text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]"
						>
							Make a Pledge
						</Link>
						<Link
							href="/harvest#highlights"
							className="text-base font-medium text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
						>
							See harvest highlights →
						</Link>
					</div>
				</Reveal>

				<Reveal delay={120}>
					<figure className="relative pb-10 sm:pr-10 sm:pb-14">
						<div className="overflow-hidden rounded-3xl shadow-xl shadow-black/10">
							<HarvestImage
								photo={photos?.[0]}
								slot="home/harvest-1"
								className="aspect-4/3 h-auto w-full"
							/>
						</div>

						{/* Second photo inset over the corner — on small screens it
						    would crowd the first, so it only appears from sm up. */}
						<div className="absolute right-0 bottom-0 hidden w-2/5 overflow-hidden rounded-2xl shadow-lg shadow-black/15 ring-8 ring-background sm:block">
							<HarvestImage
								photo={photos?.[1]}
								slot="home/harvest-2"
								className="aspect-square h-auto w-full"
							/>
						</div>

						<figcaption className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-sp-green shadow-sm backdrop-blur-sm">
							<svg aria-hidden viewBox="0 0 16 16" className="size-3.5 text-sp-gold" fill="currentColor">
								<path d="M14 2C7 2 3 5.5 3 10.5c0 1 .2 1.9.5 2.7L2 14.7l1 1 1.6-1.5c.8.3 1.6.4 2.4.4C12 14.6 14 9 14 2zm-2.4 2.6c-2.5 1.1-4.9 3.4-6.4 6.6l-.9-.4c1.5-3.4 4.1-5.9 6.9-7.1l.4.9z" />
							</svg>
							From our Harvest Thanksgiving
						</figcaption>
					</figure>
				</Reveal>
			</div>
		</section>
	);
}
