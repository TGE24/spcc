// Admin: Baptism Records (PRD §5.6, tech spec §4.6). Restricted to
// super_admin/church_staff both here (layout.tsx) and at the RLS layer.
// Records are permanent — there is intentionally no edit form, only "Add
// Amendment", matching standard sacramental record-keeping practice: the
// original entry stays untouched and corrections are appended as a
// separate, attributable trail.
import { createClient } from "@/lib/supabase/server";
import type { BaptismRecord, BaptismRecordAmendment } from "@/types/database";
import { addBaptismRecord, addAmendment } from "./actions";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
} from "@/components/admin/ui";

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
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader
        title="Baptism Records"
        description="Records are permanent once added. To correct an entry, add an amendment below it rather than editing the original."
      />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add a baptism record</h2>
        <form action={addBaptismRecord} className="mt-4 grid gap-4">
          <div>
            <AdminLabel htmlFor="child_name">Child&rsquo;s name</AdminLabel>
            <AdminInput id="child_name" name="child_name" required />
          </div>
          <div>
            <AdminLabel htmlFor="parents_names">Parents&rsquo; names</AdminLabel>
            <AdminInput id="parents_names" name="parents_names" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="date_of_birth">Date of birth</AdminLabel>
              <AdminInput id="date_of_birth" name="date_of_birth" type="date" />
            </div>
            <div>
              <AdminLabel htmlFor="baptism_date">Baptism date</AdminLabel>
              <AdminInput id="baptism_date" name="baptism_date" type="date" required />
            </div>
          </div>
          <div>
            <AdminLabel htmlFor="officiating_priest">Officiating priest</AdminLabel>
            <AdminInput id="officiating_priest" name="officiating_priest" />
          </div>
          <div>
            <AdminLabel htmlFor="godparents">Godparents</AdminLabel>
            <AdminInput id="godparents" name="godparents" />
          </div>
          <div>
            <AdminButton type="submit">Add Record</AdminButton>
          </div>
        </form>
      </AdminCard>

      <form method="get" className="flex gap-2">
        <AdminInput name="q" defaultValue={q ?? ""} placeholder="Search by child's or parents' name" className="flex-1" />
        <AdminButton type="submit" variant="subtle">
          Search
        </AdminButton>
        {q && (
          <a href="/admin/baptism-records" className="flex items-center px-3 text-sm text-neutral-500 hover:text-neutral-300">
            Clear
          </a>
        )}
      </form>

      <div className="space-y-4">
        {records?.map((record) => (
          <AdminCard key={record.id}>
            <p className="font-medium text-neutral-100">{record.child_name}</p>
            <p className="mt-1 text-sm text-neutral-400">
              Parents: {record.parents_names} · Baptized {record.baptism_date}
              {record.officiating_priest ? ` by ${record.officiating_priest}` : ""}
            </p>
            {record.godparents && (
              <p className="mt-1 text-sm text-neutral-400">Godparents: {record.godparents}</p>
            )}

            {(amendmentsByRecord.get(record.id) ?? []).length > 0 && (
              <ul className="mt-3 space-y-1 border-l-2 border-white/10 pl-3 text-sm text-neutral-400">
                {amendmentsByRecord.get(record.id)!.map((amendment) => (
                  <li key={amendment.id}>
                    <span className="text-xs text-neutral-500">
                      {new Date(amendment.created_at).toLocaleDateString()}:
                    </span>{" "}
                    {amendment.amendment_text}
                  </li>
                ))}
              </ul>
            )}

            <form action={addAmendment} className="mt-3 flex gap-2">
              <input type="hidden" name="baptism_record_id" value={record.id} />
              <AdminInput name="amendment_text" placeholder="Add amendment / correction" required className="flex-1" />
              <AdminButton type="submit" variant="subtle">
                Add
              </AdminButton>
            </form>
          </AdminCard>
        ))}
        {!records?.length && (
          <p className="text-sm text-neutral-500">
            {query ? "No records match that search." : "No records yet."}
          </p>
        )}
      </div>
    </div>
  );
}
