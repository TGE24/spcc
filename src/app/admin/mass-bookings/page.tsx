// Admin: Mass Intention bookings (PRD §5.5 admin features).
// RLS restricts this table to church_staff/super_admin only (content_manager
// has no access — bookings aren't "content"). No hard conflict limit per
// date — approve/reject is purely informational (tech spec §7).
import { createClient } from "@/lib/supabase/server";
import type { MassBooking } from "@/types/database";
import { updateBookingStatus } from "./actions";

const STATUS_STYLES: Record<MassBooking["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default async function AdminMassBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("mass_bookings")
    .select("*")
    .order("preferred_date", { ascending: true })
    .returns<MassBooking[]>();

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-6">Mass Bookings</h1>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Date</th>
            <th>Name</th>
            <th>Intention</th>
            <th>Contact</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings?.map((booking) => (
            <tr key={booking.id} className="border-b align-top">
              <td className="py-2">{booking.preferred_date}</td>
              <td>{booking.full_name}</td>
              <td>
                {booking.intention_type}
                {booking.message && <p className="text-neutral-500">{booking.message}</p>}
              </td>
              <td>
                {booking.email}
                {booking.phone && <p className="text-neutral-500">{booking.phone}</p>}
              </td>
              <td>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
                  {booking.status}
                </span>
              </td>
              <td className="space-x-2 text-right whitespace-nowrap">
                <form action={updateBookingStatus.bind(null, booking.id, "approved")} className="inline">
                  <button className="text-green-700 hover:underline">Approve</button>
                </form>
                <form action={updateBookingStatus.bind(null, booking.id, "rejected")} className="inline">
                  <button className="text-red-600 hover:underline">Reject</button>
                </form>
              </td>
            </tr>
          ))}
          {!bookings?.length && (
            <tr>
              <td colSpan={6} className="py-4 text-neutral-400">No bookings yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
