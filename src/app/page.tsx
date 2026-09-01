// Home page (PRD §5.1). Structural/functional placeholder — replace the visual
// design once the Figma landing page is available (this file's markup will be
// swapped out, the data-fetching below stays the same).
import { createClient } from "@/lib/supabase/server";
import type { MassSchedule, Announcement } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: upcomingMass }, { data: announcements }] = await Promise.all([
    supabase
      .from("mass_schedule")
      .select("*")
      .order("time", { ascending: true })
      .limit(3)
      .returns<MassSchedule[]>(),
    supabase
      .from("announcements")
      .select("*")
      .order("active_from", { ascending: false })
      .limit(3)
      .returns<Announcement[]>(),
  ]);

  return (
    <main className="flex-1">
      {/* Hero — placeholder copy/layout, pending Figma design */}
      <section className="px-6 py-16 border-b">
        <h1 className="text-3xl font-semibold">Welcome to our parish</h1>
        <p className="mt-2 max-w-xl text-neutral-600">
          A message from the parish priest goes here.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/mass-booking" className="px-4 py-2 rounded bg-neutral-900 text-white text-sm">
            Book a Mass
          </a>
          <a href="/events" className="px-4 py-2 rounded border text-sm">
            Upcoming Events
          </a>
        </div>
      </section>

      {/* Upcoming Mass widget */}
      <section className="px-6 py-10 border-b">
        <h2 className="text-lg font-medium mb-3">Upcoming Mass</h2>
        <ul className="space-y-1 text-sm text-neutral-700">
          {upcomingMass?.length ? (
            upcomingMass.map((m) => (
              <li key={m.id}>
                {m.day_type === "special" ? m.special_name : m.day_type} — {m.time}
                {m.label ? ` (${m.label})` : ""}
              </li>
            ))
          ) : (
            <li className="text-neutral-400">Mass schedule not set up yet.</li>
          )}
        </ul>
        <a href="/mass-schedule" className="mt-3 inline-block text-sm underline">
          View full schedule
        </a>
      </section>

      {/* Announcements */}
      <section className="px-6 py-10 border-b">
        <h2 className="text-lg font-medium mb-3">Announcements</h2>
        <ul className="space-y-3">
          {announcements?.length ? (
            announcements.map((a) => (
              <li key={a.id}>
                <p className="font-medium text-sm">{a.title}</p>
                {a.body && <p className="text-sm text-neutral-600">{a.body}</p>}
              </li>
            ))
          ) : (
            <li className="text-neutral-400 text-sm">No announcements right now.</li>
          )}
        </ul>
      </section>

      <footer className="px-6 py-8 text-sm text-neutral-500">
        Contact information goes here.
      </footer>
    </main>
  );
}
