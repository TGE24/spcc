// Admin: Mass Intention bookings (PRD §5.5 admin features).
// RLS restricts this table to church_staff/super_admin only (content_manager
// has no access — bookings aren't "content"). No hard conflict limit per
// date — approve/reject is purely informational (tech spec §7).
import { createClient } from "@/lib/supabase/server";
import type { MassBooking } from "@/types/database";
import { updateBookingStatus } from "./actions";
import { AdminBadge, AdminButton, AdminCard, AdminPageHeader, AdminTHead } from "@/components/admin/ui";

const STATUS_TONE: Record<MassBooking["status"], "warn" | "success" | "danger"> = {
  pending: "warn",
  approved: "success",
  rejected: "danger",
};

export default async function AdminMassBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("mass_bookings")
    .select("*")
    .order("preferred_date", { ascending: true })
    .returns<MassBooking[]>();

  return (
    <div className="max-w-4xl space-y-8">
      <AdminPageHeader title="Mass Bookings" description="Requests submitted through the public Mass Intention form." />

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <AdminTHead>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Intention</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </AdminTHead>
          <tbody className="divide-y divide-white/5">
            {bookings?.map((booking) => (
              <tr key={booking.id} className="align-top">
                <td className="px-5 py-3 text-neutral-300">{booking.preferred_date}</td>
                <td className="px-5 py-3 text-neutral-100">{booking.full_name}</td>
                <td className="px-5 py-3 text-neutral-300">
                  {booking.intention_type}
                  {booking.message && <p className="mt-1 text-xs text-neutral-500">{booking.message}</p>}
                </td>
                <td className="px-5 py-3 text-neutral-300">
                  {booking.email}
                  {booking.phone && <p className="mt-1 text-xs text-neutral-500">{booking.phone}</p>}
                </td>
                <td className="px-5 py-3">
                  <AdminBadge tone={STATUS_TONE[booking.status]}>{booking.status}</AdminBadge>
                </td>
                <td className="space-x-2 whitespace-nowrap px-5 py-3 text-right">
                  <form action={updateBookingStatus.bind(null, booking.id, "approved")} className="inline">
                    <AdminButton type="submit" variant="subtle">
                      Approve
                    </AdminButton>
                  </form>
                  <form action={updateBookingStatus.bind(null, booking.id, "rejected")} className="inline">
                    <AdminButton type="submit" variant="danger">
                      Reject
                    </AdminButton>
                  </form>
                </td>
              </tr>
            ))}
            {!bookings?.length && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-neutral-500">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}
