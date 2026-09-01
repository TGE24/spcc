import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { LogoMark } from "./icons";

// Pill-shaped translucent nav bar overlaid on a hero image (Figma: "nav bar",
// node 2:3). Used at the top of every page's hero section.
export function SiteHeader() {
  return (
    <div className="absolute left-1/2 top-6 md:top-[73px] w-[calc(100%-32px)] max-w-[1240px] -translate-x-1/2 rounded-full border-2 border-brand-700 bg-white/10 px-6 py-3 backdrop-blur-sm md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="size-10 text-white md:size-[60px]" />
          <span className="font-serif-italic text-xl italic text-white md:text-2xl">
            {siteConfig.parishName}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 md:gap-5">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2 py-1 text-sm font-medium text-white hover:text-brand-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
