// Homilies listing (PRD §5.7) — audio playback via the native <audio>
// element, sourced from audio_url (staff paste a hosted link in
// /admin/homilies; no file upload/storage pipeline needed for V1).
// Filterable by priest and by year (PRD: "Filter by date or priest").
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { Homily } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";

export default async function HomiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ priest?: string; year?: string }>;
}) {
  const { priest, year } = await searchParams;

  const supabase = await createClient();
  const allHomilies = await safeQuery(
    supabase.from("homilies").select("*").order("date", { ascending: false }).returns<Homily[]>()
  );

  const priests = Array.from(
    new Set((allHomilies ?? []).map((h) => h.priest_name).filter((p): p is string => Boolean(p)))
  ).sort();
  const years = Array.from(
    new Set((allHomilies ?? []).map((h) => h.date.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a));

  const homilies = (allHomilies ?? []).filter((h) => {
    if (priest && h.priest_name !== priest) return false;
    if (year && !h.date.startsWith(year)) return false;
    return true;
  });

  return (
    <main className="flex-1">
      <section className="relative h-[320px] overflow-hidden md:h-[380px]">
        <PlaceholderImage slot="homilies/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Homilies</h1>
          <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
            Listen back to recent homilies from our priests.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        {(priests.length > 0 || years.length > 0) && (
          <form method="get" className="mx-auto mb-10 flex max-w-3xl flex-wrap items-end gap-3 text-sm">
            {priests.length > 0 && (
              <div>
                <label className="mb-1 block text-xs text-gray-500" htmlFor="priest">
                  Priest
                </label>
                <select
                  id="priest"
                  name="priest"
                  defaultValue={priest ?? ""}
                  className="rounded-lg border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                >
                  <option value="">All priests</option>
                  {priests.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {years.length > 0 && (
              <div>
                <label className="mb-1 block text-xs text-gray-500" htmlFor="year">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  defaultValue={year ?? ""}
                  className="rounded-lg border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                >
                  <option value="">All years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-600 active:scale-[0.97]">
              Apply
            </button>
            {(priest || year) && (
              <a href="/homilies" className="px-2 py-2 text-gray-500 transition-colors duration-200 hover:text-brand-600 hover:underline">
                Clear
              </a>
            )}
          </form>
        )}

        {homilies.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-lg text-gray-500">
            {priest || year ? "No homilies match those filters." : "No homilies posted yet — check back soon."}
          </p>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {homilies.map((homily, i) => (
              <Reveal
                key={homily.id}
                delay={Math.min(i, 5) * 80}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow duration-300 hover:shadow-md md:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{homily.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(`${homily.date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {[homily.priest_name, homily.bible_reference].filter(Boolean).join(" · ")}
                </p>
                <audio controls className="mt-4 w-full" src={homily.audio_url}>
                  <a href={homily.audio_url}>Listen to {homily.title}</a>
                </audio>
                <a
                  href={homily.audio_url}
                  download
                  className="mt-2 inline-block text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700 hover:underline"
                >
                  Download audio
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
