// Public Mass schedule (PRD §5.2).
import { createClient } from "@/lib/supabase/server";
import type { MassSchedule } from "@/types/database";

export default async function MassSchedulePage() {
  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from("mass_schedule")
    .select("*")
    .order("day_type", { ascending: true })
    .order("time", { ascending: true })
    .returns<MassSchedule[]>();

  const sunday = schedule?.filter((s) => s.day_type === "sunday") ?? [];
  const weekday = schedule?.filter((s) => s.day_type === "weekday") ?? [];
  const special = schedule?.filter((s) => s.day_type === "special") ?? [];

  return (
    <main className="flex-1 px-6 py-12 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Mass Schedule</h1>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-2">Sunday Mass</h2>
        <ul className="text-sm text-neutral-700 space-y-1">
          {sunday.map((s) => (
            <li key={s.id}>
              {s.time} {s.label ? `— ${s.label}` : ""}
            </li>
          ))}
          {sunday.length === 0 && <li className="text-neutral-400">Not set up yet.</li>}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-2">Weekday Mass</h2>
        <ul className="text-sm text-neutral-700 space-y-1">
          {weekday.map((s) => (
            <li key={s.id}>
              {s.time} {s.label ? `— ${s.label}` : ""}
            </li>
          ))}
          {weekday.length === 0 && <li className="text-neutral-400">Not set up yet.</li>}
        </ul>
      </section>

      {special.length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-2">Special Celebrations</h2>
          <ul className="text-sm text-neutral-700 space-y-1">
            {special.map((s) => (
              <li key={s.id}>
                {s.special_date} — {s.special_name} ({s.time})
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
