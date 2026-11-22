// Home hero copy block, shared by the slideshow (hero-slider.tsx) and the
// placeholder hero on a fresh database (app/page.tsx) so the two never
// drift apart.
//
// Styled from the brand kit rather than generic bold sans: a tracked
// light-gold eyebrow, the heading in Cinzel (the kit's display face), a
// gold rule-and-cross ornament, then a quieter Inter subheading and two
// CTAs (gold primary, parchment outline secondary). Light Gold is the
// kit's sanctioned gold-on-dark text colour.
import Link from "next/link";

export function HeroContent({
	heading,
	subheading,
	animationKey,
}: {
	heading: string;
	subheading: string;
	// Changing this replays the entrance animation — the slider passes the
	// slide id so each new caption fades in with its image.
	animationKey?: string;
}) {
	return (
		<div className="absolute inset-0 flex items-center justify-center px-6 pt-24 pb-16 md:pt-32">
			<div
				key={animationKey}
				className="flex max-w-4xl animate-[hero-in_900ms_cubic-bezier(0.22,1,0.36,1)_both] flex-col items-center text-center"
			>
				<p className="flex items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-sp-gold-light md:text-xs">
					<span aria-hidden className="h-px w-8 bg-sp-gold-light/70 md:w-12" />
					Catholic Archdiocese of Ibadan
					<span aria-hidden className="h-px w-8 bg-sp-gold-light/70 md:w-12" />
				</p>

				<h1 className="mt-6 font-display text-[2rem] leading-[1.15] font-bold text-balance text-sp-parchment drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
					{heading}
				</h1>

				<div aria-hidden className="mt-6 flex items-center gap-3 text-sp-gold-light">
					<span className="h-px w-16 bg-linear-to-r from-transparent to-sp-gold-light/80 md:w-24" />
					<svg viewBox="0 0 12 16" className="h-4 w-3" fill="currentColor">
						<path d="M5 0h2v5h5v2H7v9H5V7H0V5h5z" />
					</svg>
					<span className="h-px w-16 bg-linear-to-l from-transparent to-sp-gold-light/80 md:w-24" />
				</div>

				<p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-sp-parchment/85 md:text-lg">
					{subheading}
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/mass-schedule"
						className="rounded-full bg-sp-gold-light px-7 py-3.5 text-sm font-semibold text-sp-green transition-all duration-200 hover:bg-sp-parchment active:scale-[0.97]"
					>
						Mass Times
					</Link>
					<Link
						href="/events"
						className="rounded-full border border-sp-parchment/50 px-7 py-3.5 text-sm font-semibold text-sp-parchment backdrop-blur-sm transition-all duration-200 hover:border-sp-parchment hover:bg-sp-parchment/10 active:scale-[0.97]"
					>
						Upcoming Events
					</Link>
				</div>
			</div>
		</div>
	);
}

// Neutral dark scrim (no colour cast on the photo): an even base wash for
// legibility of the centred copy, deepening at the top (under the header)
// and bottom (where the priest's-message card overlaps).
export function HeroScrim() {
	return (
		<>
			<div className="absolute inset-0 bg-black/50" />
			<div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60" />
		</>
	);
}
