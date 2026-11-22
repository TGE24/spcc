// Admin: Baptism Requests (Home page "Book Baptism" quick feature).
// RLS restricts this table to church_staff/super_admin only, same as
// mass_bookings (content_manager has no access — this is family/child
// data, not "content"). Separate from /admin/baptism-records: this is the
// public inquiry inbox staff triage before the baptism happens. Each request
// is confirmed on its own page (/admin/baptism-inquiries/[id]) by scheduling
// the baptism and the practice; afterward the permanent sacramental record is
// added in Baptism Records, pre-filled from the request (tech spec §4.6).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BaptismInquiry } from "@/types/database";
import { updateInquiryStatus } from "./actions";
import { STATUS_TONE, formatDay, formatTime } from "./format";
import { AdminBadge, AdminButton, AdminCard, AdminPageHeader, AdminTHead } from "@/components/admin/ui";

export default async function AdminBaptismInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("baptism_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<BaptismInquiry[]>();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Baptism Requests"
        description="Requests from the public baptism form. Open a request to confirm it: set the baptism date and the practice date for parents and godparents, and the family is emailed both. After the baptism, use Add baptism record on the request: the record form is filled in for you, and saving it closes the request."
      />

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <AdminTHead>
            <th className="px-5 py-3">Child</th>
            <th className="px-5 py-3">Parents</th>
            <th className="px-5 py-3">Contact</th>
            <th className="px-5 py-3">Baptism</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </AdminTHead>
          <tbody className="divide-y divide-white/5">
            {inquiries?.map((inquiry) => (
              <tr key={inquiry.id} className="align-top">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/baptism-inquiries/${inquiry.id}`}
                    className="font-medium text-neutral-100 hover:text-brand-700 hover:underline"
                  >
                    {inquiry.child_name}
                  </Link>
                  {inquiry.child_date_of_birth && (
                    <p className="mt-1 text-xs text-neutral-500">Born {formatDay(inquiry.child_date_of_birth)}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-neutral-300">{inquiry.parent_name}</td>
                <td className="px-5 py-3 text-neutral-300">
                  {inquiry.email}
                  {inquiry.phone && <p className="mt-1 text-xs text-neutral-500">{inquiry.phone}</p>}
                </td>
                <td className="px-5 py-3 text-neutral-300">
                  {inquiry.baptism_date ? (
                    <>
                      {formatDay(inquiry.baptism_date)}
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatTime(inquiry.baptism_time)}
                        {inquiry.practice_date && ` · Practice ${formatDay(inquiry.practice_date)}`}
                      </p>
                    </>
                  ) : inquiry.preferred_date ? (
                    <>
                      <span className="text-neutral-400">{formatDay(inquiry.preferred_date)}</span>
                      <p className="mt-1 text-xs text-neutral-500">Preferred, not confirmed</p>
                    </>
                  ) : (
                    <span className="text-neutral-500">Not set</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <AdminBadge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</AdminBadge>
                </td>
                <td className="space-x-2 whitespace-nowrap px-5 py-3 text-right">
                  {inquiry.status === "pending" && (
                    <form action={updateInquiryStatus.bind(null, inquiry.id, "contacted")} className="inline">
                      <AdminButton type="submit" variant="subtle">
                        Mark Contacted
                      </AdminButton>
                    </form>
                  )}
                  <Link
                    href={`/admin/baptism-inquiries/${inquiry.id}`}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      inquiry.status === "pending" || inquiry.status === "contacted"
                        ? "bg-brand-600 text-white shadow-sm shadow-black/30 hover:bg-brand-700"
                        : "border border-white/10 text-neutral-200 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {inquiry.status === "pending" || inquiry.status === "contacted" ? "Confirm & schedule" : "View"}
                  </Link>
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
