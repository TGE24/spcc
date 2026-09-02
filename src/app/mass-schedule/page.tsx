// Mass Schedule — implemented from Figma node 28:225. Weekday/Sunday cards
// are data-driven from mass_schedule so this never drifts from what admins
// enter in /admin/mass-schedule; the "Special Masses" messaging is static
// copy from the design (points people to the Events page for specifics).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { MassSchedule } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QuoteBanner } from "@/components/quote-banner";
import { PlaceholderImage } from "@/components/placeholder-image";

export default async function MassSchedulePage() {
  const supabase = await createClient();
  const schedule = await safeQuery(
    supabase
      .from("mass_schedule")
      .select("*")
      .order("day_type", { ascending: true })
      .order("time", { ascending: true })
      .returns<MassSchedule[]>()
  );

  const weekday = schedule?.filter((s) => s.day_type === "weekday") ?? [];
  const sunday = schedule?.filter((s) => s.day_type === "sunday") ?? [];
  const special = schedule?.filter((s) => s.day_type === "special") ?? [];

  return (
    <main className="flex-1">
      <section className="relative h-[400px] overflow-hidden md:h-[524px]">
        <PlaceholderImage slot="mass-schedule/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#111010]/41" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[60%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Mass Schedule for this week</h1>
          <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
            Join us in worship and experience the presence of God through our daily and
            weekend Mass celebrations.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Weekday Mass
        </h2>
        <ScheduleCard imageSlot="mass-schedule/weekday" imageSide="left">
          <p className="text-sm font-semibold text-brand-600">
            {weekday[0] ? `${weekday[0].time} / Venue: Church Auditorium` : "Venue: Church Auditorium"}
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">Monday – Friday</p>
          {weekday.length > 0 ? (
            <p className="mt-2 text-gray-500">
              {weekday.map((w) => w.label ? `${w.time} (${w.label})` : w.time).join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-gray-400">Not set up yet — add times in the admin dashboard.</p>
          )}
        </ScheduleCard>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 pb-16 md:px-[100px]">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Sunday Mass
        </h2>
        <ScheduleCard imageSlot="mass-schedule/sunday" imageSide="right">
          <p className="text-sm font-semibold text-brand-600">Venue: Church Auditorium</p>
          <div className="mt-3 space-y-3 text-2xl font-semibold text-gray-900">
            {sunday.length > 0 ? (
              sunday.map((s, i) => (
                <p key={s.id}>
                  {["First", "Second", "Third", "Fourth"][i] ?? "Additional"} Mass: {s.time}
                  {s.label ? ` (${s.label})` : ""}
                </p>
              ))
            ) : (
              <p className="text-base font-normal text-gray-400">
                Not set up yet — add times in the admin dashboard.
              </p>
            )}
          </div>
        </ScheduleCard>
      </section>

      <QuoteBanner title="Special Masses">
        <p>
          Holy Days, Feast Days, and special celebrations will be announced in advance.
          Please check our events page or contact the parish office for updates.
        </p>
        {special.length > 0 && (
          <ul className="mt-6 space-y-1 text-base">
            {special.map((s) => (
              <li key={s.id}>
                {s.special_date} — {s.special_name} ({s.time})
              </li>
            ))}
          </ul>
        )}
      </QuoteBanner>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-10 text-center md:p-16">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            You Are Always Welcome
          </h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-lg text-gray-500 md:text-xl">
            <p>
              Whether you are visiting for the first time or looking for a spiritual home,
              we invite you to join us in worship and fellowship.
            </p>
            <p>Come as you are, and be part of a community that cares, supports, and grows together in faith.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/about" className="rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]">
              Learn More About Our Programs
            </Link>
            <Link href="/events" className="rounded-3xl border border-brand-600 px-7 py-5 text-lg text-brand-600 transition-all duration-200 hover:bg-brand-50 active:scale-[0.97]">
              View Events
            </Link>
            <Link href="/organizations" className="rounded-3xl px-7 py-5 text-lg text-brand-600 transition-all duration-200 hover:bg-brand-50 active:scale-[0.97]">
              Join a Group
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ScheduleCard({
  children,
  imageSlot,
  imageSide,
}: {
  children: React.ReactNode;
  imageSlot: string;
  imageSide: "left" | "right";
}) {
  const image = (
    <PlaceholderImage slot={imageSlot} label="Mass photo" className="h-[240px] flex-1 md:h-[337px]" />
  );
  const content = (
    <div className="flex flex-1 flex-col justify-center gap-3 p-6 md:p-8">{children}</div>
  );
  return (
    <div className="mx-auto flex max-w-[1110px] flex-col overflow-hidden rounded-2xl border border-gray-200 md:flex-row">
      {imageSide === "left" ? (
        <>
          {image}
          {content}
        </>
      ) : (
        <>
          {content}
          {image}
        </>
      )}
    </div>
  );
}
