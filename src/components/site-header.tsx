"use client";
// Pill-shaped nav bar (Figma: "nav bar", node 2:3). Fixed to the viewport
// (not just overlaid on each page's hero) so it stays visible the whole
// time someone scrolls, on every page. It starts translucent over the hero
// image, then — once the page scrolls past the hero — swaps to a solid,
// compact bar so the links stay legible over ordinary (usually light) page
// content instead of disappearing into it.
//
// Below `md`, the link row (5 items) doesn't fit next to the logo inside a
// pill shape — it used to just wrap and mangle the pill. Instead the links
// collapse behind a hamburger button that drops down a solid, full-width
// menu panel, standard mobile-nav pattern.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { CloseIcon, LogoMark, MenuIcon } from "./icons";

const SCROLL_THRESHOLD = 40;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (covers link clicks as well as
  // browser back/forward). Adjusted during render rather than in an effect
  // (React's recommended pattern for "reset state when a prop changes") so
  // it doesn't trigger an extra cascading render.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  const textColor = scrolled ? "text-gray-900" : "text-white";

  return (
    <div
      className={`fixed left-1/2 z-50 w-[calc(100%-32px)] max-w-[1240px] -translate-x-1/2 transition-all duration-300 ${
        scrolled ? "top-3 md:top-4" : "top-6 md:top-[73px]"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-4 rounded-full px-6 py-3 backdrop-blur-md transition-all duration-300 md:px-10 ${
          scrolled
            ? "border border-black/5 bg-white/95 shadow-lg shadow-black/10"
            : "border-2 border-brand-700 bg-white/10"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <LogoMark
            className={`size-10 shrink-0 transition-colors duration-300 md:size-[60px] ${
              scrolled ? "text-brand-600" : "text-white"
            }`}
          />
          <span className={`font-serif-italic text-xl italic transition-colors duration-300 md:text-2xl ${textColor}`}>
            {siteConfig.parishName}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
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

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 md:hidden ${textColor}`}
        >
          {menuOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {/* Mobile dropdown — always solid regardless of scroll state, since
          once open it's a standalone panel over whatever's underneath, not
          a translucent overlay on a known-dark hero image. */}
      {menuOpen && (
        <nav className="mt-2 flex flex-col gap-1 rounded-2xl border border-black/5 bg-white/95 p-2 shadow-lg shadow-black/10 backdrop-blur-md md:hidden">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
