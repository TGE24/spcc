"use client";
// Home page hero — renders whatever's configured in /admin/hero. A single
// slide looks exactly like the old static hero (no controls at all); two or
// more become an auto-advancing slideshow with dots + arrows, pausing on
// hover so a reader isn't fighting the timer while looking at a caption.
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import type { HeroSlide } from "@/types/database";

const AUTOPLAY_MS = 6000;
const DEFAULT_HEADING = "Welcome to Our Parish Family";
const DEFAULT_SUBHEADING =
  "A place of worship, community, and spiritual growth. Join us in celebrating faith, love, and service.";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMultiple = slides.length > 1;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (!hasMultiple || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [hasMultiple, paused, slides.length]);

  const slide = slides[index];

  return (
    <section
      className="relative h-[500px] overflow-hidden md:h-[763px]"
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
      <div className="absolute inset-0 bg-[#3a3535]/75" />
      <SiteHeader />
      <div className="absolute left-1/2 top-[45%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
        <h1 className="text-3xl font-bold md:text-5xl">{slide.heading || DEFAULT_HEADING}</h1>
        <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
          {slide.subheading || DEFAULT_SUBHEADING}
        </p>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 md:left-8"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 md:right-8"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
