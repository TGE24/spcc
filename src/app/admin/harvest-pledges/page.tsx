// Admin: view Harvest & Thanksgiving pledges (PRD §5.10 admin features).
// View-only by design — RLS (0002_rls.sql) gives staff select access but no
// write policy, since pledges come in from the public form and payment
// follow-up happens offline; there is nothing for staff to edit here.
import { createClient } from "@/lib/supabase/server";
import type { HarvestPledge } from "@/types/database";

export default async function AdminHarvestPledgesPage() {
  const supabase = await createClient();
  const { data: pledges } = await supabase
    .from("harvest_pledges")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<HarvestPledge[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Harvest Pledges</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Submitted from the public Harvest page. Follow up on payment directly with each pledger —
        this list is for tracking only.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Pledger</th>
            <th>Category</th>
            <th>Details</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {pledges?.map((pledge) => (
            <tr key={pledge.id} className="border-b">
              <td className="py-2">{pledge.pledger_name}</td>
              <td className="capitalize">{pledge.category}</td>
              <td>{pledge.pledge_details}</td>
              <td>{new Date(pledge.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {!pledges?.length && (
            <tr>
              <td colSpan={4} className="py-4 text-neutral-400">No pledges yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
