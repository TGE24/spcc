// Admin: Baptism Requests (Home page "Book Baptism" quick feature).
// RLS restricts this table to church_staff/super_admin only, same as
// mass_bookings (content_manager has no access — this is family/child
// data, not "content"). Separate from /admin/baptism-records: this is the
// public inquiry inbox staff triage before the baptism happens; the
// permanent sacramental record is created by hand afterward via "Add a
// baptism record" on that other page (tech spec §4.6).
import { createClient } from "@/lib/supabase/server";
import type { BaptismInquiry } from "@/types/database";
import { updateInquiryStatus } from "./actions";
import { AdminBadge, AdminButton, AdminCard, AdminPageHeader, AdminTHead } from "@/components/admin/ui";

const STATUS_TONE: Record<BaptismInquiry["status"], "warn" | "brand" | "success"> = {
  pending: "warn",
  contacted: "brand",
  closed: "success",
};

export default async function AdminBaptismInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("baptism_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<BaptismInquiry[]>();

  return (
    <div className="max-w-4xl space-y-8">
      <AdminPageHeader
        title="Baptism Requests"
        description="Requests submitted through the public baptism request form. Once a baptism has taken place, add the permanent record from Baptism Records and mark the request Closed here."
      />

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <AdminTHead>
            <th className="px-5 py-3">Child</th>
            <th className="px-5 py-3">Parent / Guardian</th>
            <th className="px-5 py-3">Contact</th>
            <th className="px-5 py-3">Preferred Date</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </AdminTHead>
          <tbody className="divide-y divide-white/5">
            {inquiries?.map((inquiry) => (
              <tr key={inquiry.id} className="align-top">
                <td className="px-5 py-3 text-neutral-100">
                  {inquiry.child_name}
                  {inquiry.child_date_of_birth && (
                    <p className="mt-1 text-xs text-neutral-500">DOB {inquiry.child_date_of_birth}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-neutral-300">
                  {inquiry.parent_name}
                  {inquiry.message && <p className="mt-1 text-xs text-neutral-500">{inquiry.message}</p>}
                </td>
                <td className="px-5 py-3 text-neutral-300">
                  {inquiry.email}
                  {inquiry.phone && <p className="mt-1 text-xs text-neutral-500">{inquiry.phone}</p>}
                </td>
                <td className="px-5 py-3 text-neutral-300">{inquiry.preferred_date ?? "—"}</td>
                <td className="px-5 py-3">
                  <AdminBadge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</AdminBadge>
                </td>
                <td className="space-x-2 whitespace-nowrap px-5 py-3 text-right">
                  {inquiry.status !== "contacted" && (
                    <form action={updateInquiryStatus.bind(null, inquiry.id, "contacted")} className="inline">
                      <AdminButton type="submit" variant="subtle">
                        Mark Contacted
                      </AdminButton>
                    </form>
                  )}
                  {inquiry.status !== "closed" && (
                    <form action={updateInquiryStatus.bind(null, inquiry.id, "closed")} className="inline">
                      <AdminButton type="submit" variant="ghost">
                        Close
                      </AdminButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!inquiries?.length && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-neutral-500">
                  No baptism requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}
