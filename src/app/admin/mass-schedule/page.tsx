// Admin: manage Mass schedule (PRD §5.2 admin features).
// Access control: RLS (0002_rls.sql) already restricts writes to staff roles;
// this page is also only reachable via /admin, which is auth-gated in layout.tsx.
import { createClient } from "@/lib/supabase/server";
import type { MassSchedule } from "@/types/database";
import { addMassTime, deleteMassTime } from "./actions";

export default async function AdminMassSchedulePage() {
  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from("mass_schedule")
    .select("*")
    .order("day_type", { ascending: true })
    .order("time", { ascending: true })
    .returns<MassSchedule[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Mass Schedule</h1>

      <form action={addMassTime} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add Mass time</h2>
        <div className="flex gap-3">
          <select name="day_type" className="border rounded px-2 py-1" required>
            <option value="sunday">Sunday</option>
            <option value="weekday">Weekday</option>
            <option value="special">Special celebration</option>
          </select>
          <input name="time" type="time" required className="border rounded px-2 py-1" />
          <input name="label" placeholder="Label (optional)" className="border rounded px-2 py-1 flex-1" />
        </div>
        <div className="flex gap-3">
          <input name="special_date" type="date" placeholder="Special date" className="border rounded px-2 py-1" />
          <input name="special_name" placeholder="Special name (e.g. Easter)" className="border rounded px-2 py-1 flex-1" />
        </div>
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Type</th>
            <th>Time</th>
            <th>Label / Special</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedule?.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="py-2">{s.day_type}</td>
              <td>{s.time}</td>
              <td>{s.day_type === "special" ? `${s.special_date} — ${s.special_name}` : s.label}</td>
              <td className="text-right">
                <form action={deleteMassTime.bind(null, s.id)}>
                  <button className="text-red-600 hover:underline">Delete</button>
                </form>
              </td>
            </tr>
          ))}
          {!schedule?.length && (
            <tr>
              <td colSpan={4} className="py-4 text-neutral-400">No Mass times yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
