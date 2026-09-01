// Homilies listing (PRD §5.7) — audio playback via the native <audio>
// element, sourced from audio_url (staff paste a hosted link in
// /admin/homilies; no file upload/storage pipeline needed for V1).
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { Homily } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";

export default async function HomiliesPage() {
  const supabase = await createClient();
  const homilies = await safeQuery(
    supabase.from("homilies").select("*").order("date", { ascending: false }).returns<Homily[]>()
  );

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

      <section className="px-6 py-16 md:px-[100px]">
        {!homilies || homilies.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-lg text-gray-500">
            No homilies posted yet — check back soon.
          </p>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {homilies.map((homily) => (
              <div key={homily.id} className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
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
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
