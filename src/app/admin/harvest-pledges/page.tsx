// Admin: view Harvest & Thanksgiving pledges (PRD §5.10 admin features).
// View-only by design — RLS (0002_rls.sql) gives staff select access but no
// write policy, since pledges come in from the public form and payment
// follow-up happens offline; there is nothing for staff to edit here.
import { createClient } from "@/lib/supabase/server";
import type { HarvestPledge } from "@/types/database";
import { AdminCard, AdminPageHeader, AdminTHead } from "@/components/admin/ui";

export default async function AdminHarvestPledgesPage() {
  const supabase = await createClient();
  const { data: pledges } = await supabase
    .from("harvest_pledges")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<HarvestPledge[]>();

  return (
    <div className="max-w-3xl space-y-8">
      <AdminPageHeader
        title="Harvest Pledges"
        description="Submitted from the public Harvest page. Follow up on payment directly with each pledger — this list is for tracking only."
      />

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <AdminTHead>
              <th className="px-5 py-3">Pledger</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Details</th>
              <th className="px-5 py-3">Submitted</th>
            </AdminTHead>
          <tbody className="divide-y divide-white/5">
            {pledges?.map((pledge) => (
              <tr key={pledge.id}>
                <td className="px-5 py-3 text-neutral-100">{pledge.pledger_name}</td>
                <td className="px-5 py-3 capitalize text-neutral-300">{pledge.category}</td>
                <td className="px-5 py-3 text-neutral-300">{pledge.pledge_details}</td>
                <td className="px-5 py-3 text-neutral-400">
                  {new Date(pledge.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!pledges?.length && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-neutral-500">
                  No pledges yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}
