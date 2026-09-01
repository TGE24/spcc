import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { MassSchedule } from "@/types/database";
import { siteConfig } from "@/lib/site-config";
import { FacebookIcon, InstagramIcon, LogoMark, XIcon } from "./icons";

// Not part of the Figma footer design, but these pages have no other home
// in primary navigation, so a quiet secondary row keeps them reachable.
const MORE_LINKS = [
  { href: "/organizations", label: "Groups & Societies" },
  { href: "/homilies", label: "Homilies" },
  { href: "/projects", label: "Projects" },
  { href: "/harvest", label: "Harvest & Thanksgiving" },
];

// Footer (Figma node 17:4809), with the "Worship with us" mass times pulled
// live from the mass_schedule table instead of hardcoded, so it never drifts
// out of sync with the admin-managed schedule.
export async function SiteFooter() {
  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from("mass_schedule")
    .select("*")
    .in("day_type", ["sunday", "weekday"])
    .order("day_type", { ascending: true })
    .order("time", { ascending: true })
    .returns<MassSchedule[]>();

  const weekday = schedule?.filter((s) => s.day_type === "weekday") ?? [];
  const sunday = schedule?.filter((s) => s.day_type === "sunday") ?? [];

  return (
    <footer className="bg-brand-600 px-6 py-12 text-white md:px-[100px] md:py-16">
      <div className="flex items-center gap-3">
        <LogoMark className="size-16" />
        <span className="font-serif-italic text-3xl italic md:text-4xl">
          {siteConfig.parishName}
        </span>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="mb-3 text-sm font-semibold">Contact Us</p>
          <p className="text-sm">{siteConfig.address}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Worship with us (Mass)</p>
          <div className="space-y-1 text-sm">
            {weekday.length > 0 && (
              <p>
                Monday – Friday ({weekday.map((w) => w.time).join(", ")})
              </p>
            )}
            {sunday.map((s) => (
              <p key={s.id}>
                Sunday ({s.time}
                {s.label ? ` — ${s.label}` : ""})
              </p>
            ))}
            {weekday.length === 0 && sunday.length === 0 && (
              <p className="text-white/70">Schedule not set up yet.</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Parish Office</p>
          <div className="space-y-1 text-sm">
            {siteConfig.phones.map((phone, i) => (
              <p key={i}>{phone}</p>
            ))}
            <p>{siteConfig.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-6 text-sm text-white/80">
        {MORE_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 border-t border-white/20 pt-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm">
            © {new Date().getFullYear()} {siteConfig.parishName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <FacebookIcon className="size-6" />
            <InstagramIcon className="size-6" />
            <XIcon className="size-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
