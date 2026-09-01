// Admin: manage Mass schedule (PRD §5.2 admin features).
// Access control: RLS (0002_rls.sql) already restricts writes to staff roles;
// this page is also only reachable via /admin, which is auth-gated in layout.tsx.
import { createClient } from "@/lib/supabase/server";
import type { MassSchedule } from "@/types/database";
import { addMassTime, deleteMassTime } from "./actions";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminSelect,
  AdminTHead,
} from "@/components/admin/ui";

export default async function AdminMassSchedulePage() {
  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from("mass_schedule")
    .select("*")
    .order("day_type", { ascending: true })
    .order("time", { ascending: true })
    .returns<MassSchedule[]>();

  return (
    <div className="max-w-3xl space-y-8">
      <AdminPageHeader title="Mass Schedule" description="Times shown on the public Mass Schedule page." />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add Mass time</h2>
        <form action={addMassTime} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <AdminLabel htmlFor="day_type">Type</AdminLabel>
              <AdminSelect id="day_type" name="day_type" required defaultValue="sunday">
                <option value="sunday">Sunday</option>
                <option value="weekday">Weekday</option>
                <option value="special">Special celebration</option>
              </AdminSelect>
            </div>
            <div>
              <AdminLabel htmlFor="time">Time</AdminLabel>
              <AdminInput id="time" name="time" type="time" required />
            </div>
            <div>
              <AdminLabel htmlFor="label">Label (optional)</AdminLabel>
              <AdminInput id="label" name="label" placeholder="Family Mass" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="special_date">Special date</AdminLabel>
              <AdminInput id="special_date" name="special_date" type="date" />
            </div>
            <div>
              <AdminLabel htmlFor="special_name">Special name</AdminLabel>
              <AdminInput id="special_name" name="special_name" placeholder="e.g. Easter" />
            </div>
          </div>
          <div>
            <AdminButton type="submit">Add</AdminButton>
          </div>
        </form>
      </AdminCard>

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <AdminTHead>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Label / Special</th>
              <th className="px-5 py-3" />
            </AdminTHead>
          <tbody className="divide-y divide-white/5">
            {schedule?.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3 capitalize text-neutral-200">{s.day_type}</td>
                <td className="px-5 py-3 text-neutral-300">{s.time}</td>
                <td className="px-5 py-3 text-neutral-300">
                  {s.day_type === "special" ? `${s.special_date} — ${s.special_name}` : s.label}
                </td>
                <td className="px-5 py-3 text-right">
                  <form action={deleteMassTime.bind(null, s.id)}>
                    <AdminButton type="submit" variant="danger">
                      Delete
                    </AdminButton>
                  </form>
                </td>
              </tr>
            ))}
            {!schedule?.length && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-neutral-500">
                  No Mass times yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}
