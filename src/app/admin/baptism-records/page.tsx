// Admin: Baptism Records (PRD §5.6, tech spec §4.6). Restricted to
// super_admin/church_staff both here (layout.tsx) and at the RLS layer.
// Records are permanent — there is intentionally no edit form, only "Add
// Amendment", matching standard sacramental record-keeping practice: the
// original entry stays untouched and corrections are appended as a
// separate, attributable trail.
import { createClient } from "@/lib/supabase/server";
import type { BaptismRecord, BaptismRecordAmendment } from "@/types/database";
import { addBaptismRecord, addAmendment } from "./actions";

export default async function AdminBaptismRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const supabase = await createClient();
  const [{ data: allRecords }, { data: amendments }] = await Promise.all([
    supabase.from("baptism_records").select("*").order("baptism_date", { ascending: false }).returns<BaptismRecord[]>(),
    supabase.from("baptism_record_amendments").select("*").order("created_at", { ascending: true }).returns<BaptismRecordAmendment[]>(),
  ]);

  const query = q?.trim().toLowerCase();
  const records = query
    ? allRecords?.filter(
        (r) =>
          r.child_name.toLowerCase().includes(query) || r.parents_names.toLowerCase().includes(query)
      )
    : allRecords;

  const amendmentsByRecord = new Map<string, BaptismRecordAmendment[]>();
  for (const amendment of amendments ?? []) {
    const list = amendmentsByRecord.get(amendment.baptism_record_id) ?? [];
    list.push(amendment);
    amendmentsByRecord.set(amendment.baptism_record_id, list);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Baptism Records</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Records are permanent once added. To correct an entry, add an amendment below it rather
        than editing the original.
      </p>

      <form action={addBaptismRecord} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add a baptism record</h2>
        <input name="child_name" placeholder="Child's name" required className="w-full border rounded px-2 py-1" />
        <input name="parents_names" placeholder="Parents' names" required className="w-full border rounded px-2 py-1" />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Date of birth</label>
            <input name="date_of_birth" type="date" className="w-full border rounded px-2 py-1" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Baptism date</label>
            <input name="baptism_date" type="date" required className="w-full border rounded px-2 py-1" />
          </div>
        </div>
        <input name="officiating_priest" placeholder="Officiating priest" className="w-full border rounded px-2 py-1" />
        <input name="godparents" placeholder="Godparents" className="w-full border rounded px-2 py-1" />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add Record
        </button>
      </form>

      <form method="get" className="mb-4 flex gap-2 text-sm">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by child's or parents' name"
          className="flex-1 border rounded px-2 py-1"
        />
        <button type="submit" className="border rounded px-3 py-1 hover:bg-neutral-50">
          Search
        </button>
        {q && (
          <a href="/admin/baptism-records" className="px-3 py-1 text-neutral-500 hover:underline">
            Clear
          </a>
        )}
      </form>

      <div className="space-y-6">
        {records?.map((record) => (
          <div key={record.id} className="border rounded p-4 text-sm">
            <p className="font-medium">{record.child_name}</p>
            <p className="text-neutral-500">
              Parents: {record.parents_names} · Baptized {record.baptism_date}
              {record.officiating_priest ? ` by ${record.officiating_priest}` : ""}
            </p>
            {record.godparents && <p className="text-neutral-500">Godparents: {record.godparents}</p>}

            {(amendmentsByRecord.get(record.id) ?? []).length > 0 && (
              <ul className="mt-3 space-y-1 border-l-2 pl-3 text-neutral-600">
                {amendmentsByRecord.get(record.id)!.map((amendment) => (
                  <li key={amendment.id}>
                    <span className="text-xs text-neutral-400">
                      {new Date(amendment.created_at).toLocaleDateString()}:
                    </span>{" "}
                    {amendment.amendment_text}
                  </li>
                ))}
              </ul>
            )}

            <form action={addAmendment} className="mt-3 flex gap-2">
              <input type="hidden" name="baptism_record_id" value={record.id} />
              <input
                name="amendment_text"
                placeholder="Add amendment / correction"
                required
                className="flex-1 border rounded px-2 py-1"
              />
              <button type="submit" className="border rounded px-3 py-1 hover:bg-neutral-50">
                Add
              </button>
            </form>
          </div>
        ))}
        {!records?.length && (
          <p className="text-neutral-400 text-sm">
            {query ? "No records match that search." : "No records yet."}
          </p>
        )}
      </div>
    </div>
  );
}
