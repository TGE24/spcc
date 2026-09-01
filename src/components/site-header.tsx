"use client";
// Pill-shaped nav bar (Figma: "nav bar", node 2:3). Fixed to the viewport
// (not just overlaid on each page's hero) so it stays visible the whole
// time someone scrolls, on every page. It starts translucent over the hero
// image, then — once the page scrolls past the hero — swaps to a solid,
// compact bar so the links stay legible over ordinary (usually light) page
// content instead of disappearing into it.
import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { LogoMark } from "./icons";

const SCROLL_THRESHOLD = 40;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed left-1/2 z-50 w-[calc(100%-32px)] max-w-[1240px] -translate-x-1/2 rounded-full px-6 py-3 backdrop-blur-md transition-all duration-300 md:px-10 ${
        scrolled
          ? "top-3 border border-black/5 bg-white/95 shadow-lg shadow-black/10 md:top-4"
          : "top-6 border-2 border-brand-700 bg-white/10 md:top-[73px]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark
            className={`size-10 transition-colors duration-300 md:size-[60px] ${
              scrolled ? "text-brand-600" : "text-white"
            }`}
          />
          <span
            className={`font-serif-italic text-xl italic transition-colors duration-300 md:text-2xl ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            {siteConfig.parishName}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 md:gap-5">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-2 py-1 text-sm font-medium transition-colors duration-300 ${
                scrolled ? "text-gray-700 hover:text-brand-600" : "text-white hover:text-brand-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
