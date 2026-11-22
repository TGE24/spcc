// Admin: Baptism Records (PRD §5.6, tech spec §4.6). Restricted to
// super_admin/church_staff both here (layout.tsx) and at the RLS layer.
// Records are permanent — there is intentionally no edit form, only "Add
// Amendment", matching standard sacramental record-keeping practice: the
// original entry stays untouched and corrections are appended as a
// separate, attributable trail.
//
// "Add a baptism record" can be pre-filled from a scheduled baptism request
// (?from=<inquiry id>, linked from the request's page) so the office checks
// the details rather than retyping them. Saving closes that request.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BaptismInquiry, BaptismRecord, BaptismRecordAmendment } from "@/types/database";
import { addBaptismRecord, addAmendment } from "./actions";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
} from "@/components/admin/ui";

function joinNames(...names: (string | null | undefined)[]) {
  return names.map((n) => n?.trim()).filter(Boolean).join(" & ");
}

export default async function AdminBaptismRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; error?: string; added?: string }>;
}) {
  const { q, from, error, added } = await searchParams;

  const supabase = await createClient();
  const [{ data: allRecords }, { data: amendments }, { data: source }] = await Promise.all([
    supabase.from("baptism_records").select("*").order("baptism_date", { ascending: false }).returns<BaptismRecord[]>(),
    supabase.from("baptism_record_amendments").select("*").order("created_at", { ascending: true }).returns<BaptismRecordAmendment[]>(),
    from
      ? supabase.from("baptism_inquiries").select("*").eq("id", from).maybeSingle<BaptismInquiry>()
      : Promise.resolve({ data: null }),
  ]);

  // A closed request has already been turned into a record (or abandoned),
  // so don't offer it for pre-fill again.
  const prefill = source && source.status !== "closed" ? source : null;
  const prefillValues = prefill
    ? {
        child_name: prefill.child_name,
        parents_names: prefill.father_name || prefill.mother_name
          ? joinNames(prefill.father_name, prefill.mother_name)
          : prefill.parent_name,
        date_of_birth: prefill.child_date_of_birth ?? "",
        baptism_date: prefill.baptism_date ?? "",
        godparents: joinNames(prefill.godfather_name, prefill.godmother_name),
      }
    : null;

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

      {error && <AdminAlert>{error}</AdminAlert>}
      {added && <AdminAlert tone="success">Record added for {added}.</AdminAlert>}
      {from && !prefill && !error && (
        <AdminAlert>
          That baptism request couldn&apos;t be used to fill in the form. It may already be closed.
        </AdminAlert>
      )}

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add a baptism record</h2>
        {prefill && (
          <p className="mt-2 text-sm text-neutral-400">
            Filled in from{" "}
            <Link href={`/admin/baptism-inquiries/${prefill.id}`} className="text-brand-700 hover:underline">
              {prefill.child_name}&rsquo;s baptism request
            </Link>
            . Check each detail against the register before saving. Saving also closes the request.
          </p>
        )}
        {/* key: remount when switching between blank and pre-filled so the
            uncontrolled defaultValues refresh */}
        <form key={prefill?.id ?? "blank"} action={addBaptismRecord} className="mt-4 grid gap-4">
          {prefill && <input type="hidden" name="inquiry_id" value={prefill.id} />}
          <div>
            <AdminLabel htmlFor="child_name">Child&rsquo;s name</AdminLabel>
            <AdminInput id="child_name" name="child_name" required defaultValue={prefillValues?.child_name} />
          </div>
          <div>
            <AdminLabel htmlFor="parents_names">Parents&rsquo; names</AdminLabel>
            <AdminInput
              id="parents_names"
              name="parents_names"
              required
              defaultValue={prefillValues?.parents_names}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="date_of_birth">Date of birth</AdminLabel>
              <AdminInput
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                defaultValue={prefillValues?.date_of_birth}
              />
            </div>
            <div>
              <AdminLabel htmlFor="baptism_date">Baptism date</AdminLabel>
              <AdminInput
                id="baptism_date"
                name="baptism_date"
                type="date"
                required
                defaultValue={prefillValues?.baptism_date}
              />
            </div>
          </div>
          <div>
            <AdminLabel htmlFor="officiating_priest">Officiating priest</AdminLabel>
            <AdminInput id="officiating_priest" name="officiating_priest" autoFocus={Boolean(prefill)} />
          </div>
          <div>
            <AdminLabel htmlFor="godparents">Godparents</AdminLabel>
            <AdminInput id="godparents" name="godparents" defaultValue={prefillValues?.godparents} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton type="submit">Add Record</AdminButton>
            {prefill && (
              <Link href="/admin/baptism-records" className="text-sm text-neutral-500 hover:text-neutral-300">
                Start blank instead
              </Link>
            )}
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
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-neutral-100">{record.child_name}</p>
              <a
                href={`/certificates/baptism/${record.id}`}
                target="_blank"
                className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
              >
                Certificate ↗
              </a>
            </div>
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
