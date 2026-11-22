"use client";
// Home page hero — renders whatever's configured in /admin/hero. A single
// slide looks exactly like the old static hero (no controls at all); two or
// more become an auto-advancing slideshow with dots + arrows, pausing on
// hover so a reader isn't fighting the timer while looking at a caption.
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroContent, HeroScrim } from "@/components/hero-content";
import type { HeroSlide } from "@/types/database";
import type { HeroCopy } from "@/lib/hero";

const AUTOPLAY_MS = 6000;

// `defaults` is the admin-set default copy (see resolveHeroDefaults) — used
// by any slide that doesn't override its own heading/subheading.
export function HeroSlider({
	slides,
	defaults,
}: {
	slides: HeroSlide[];
	defaults: HeroCopy;
}) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const hasMultiple = slides.length > 1;

	const goTo = useCallback(
		(next: number) => {
			setIndex(((next % slides.length) + slides.length) % slides.length);
		},
		[slides.length],
	);

	useEffect(() => {
		if (!hasMultiple || paused) return;
		const id = setInterval(
			() => setIndex((i) => (i + 1) % slides.length),
			AUTOPLAY_MS,
		);
		return () => clearInterval(id);
	}, [hasMultiple, paused, slides.length]);

	const slide = slides[index];

	return (
		<section
			className="relative h-[80vh] min-h-125 overflow-hidden"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			{slides.map((s, i) => (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					key={s.id}
					src={s.image_url}
					alt=""
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
						i === index ? "opacity-100" : "opacity-0"
					}`}
				/>
			))}
			<HeroScrim />
			<SiteHeader />
			<HeroContent
				heading={slide.heading || defaults.heading}
				subheading={slide.subheading || defaults.subheading}
				animationKey={slide.id}
			/>

			{hasMultiple && (
				<>
					<button
						type="button"
						aria-label="Previous slide"
						onClick={() => goTo(index - 1)}
						className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 md:left-8"
					>
						<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
							<path
								d="M12 4l-6 6 6 6"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						type="button"
						aria-label="Next slide"
						onClick={() => goTo(index + 1)}
						className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 md:right-8"
					>
						<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
							<path
								d="M8 4l6 6-6 6"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
						{slides.map((s, i) => (
							<button
								key={s.id}
								type="button"
								aria-label={`Go to slide ${i + 1}`}
								onClick={() => goTo(i)}
								className={`h-2 rounded-full transition-all ${
									i === index
										? "w-6 bg-white"
										: "w-2 bg-white/50 hover:bg-white/80"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</section>
	);
}
