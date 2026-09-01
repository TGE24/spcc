// Role-gated admin shell (PRD §5.11 / tech spec §4.1).
// Every admin route lives under here — auth + role are checked once, server-side,
// on top of the RLS policies that enforce the same rules at the database layer.
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Supabase not configured/reachable yet — treat as unauthenticated
    // rather than crashing the page (see SETUP.md).
    redirect("/login?error=Can%27t%20reach%20Supabase%20yet%20%E2%80%94%20finish%20SETUP.md%20first.");
  }

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  if (!profile) {
    // Auth account exists but has no profile row — shouldn't happen given the
    // signup trigger (0003_profile_trigger.sql), but fail safe rather than open.
    redirect("/login?error=No%20staff%20profile%20found%20for%20this%20account.");
  }

  const canManageBaptismRecords = profile.role === "super_admin" || profile.role === "church_staff";
  const canManageUsers = profile.role === "super_admin";

  return (
    <div className="flex-1 flex">
      <aside className="w-56 border-r px-4 py-6 text-sm space-y-1">
        <p className="text-xs uppercase text-neutral-400 mb-3">
          {profile.full_name} · {profile.role}
        </p>
        <Link className="block py-1 hover:underline" href="/admin">Dashboard</Link>
        <Link className="block py-1 hover:underline" href="/admin/announcements">Announcements</Link>
        <Link className="block py-1 hover:underline" href="/admin/mass-schedule">Mass Schedule</Link>
        <Link className="block py-1 hover:underline" href="/admin/mass-bookings">Mass Bookings</Link>
        <Link className="block py-1 hover:underline" href="/admin/organizations">Organizations</Link>
        <Link className="block py-1 hover:underline" href="/admin/homilies">Homilies</Link>
        <Link className="block py-1 hover:underline" href="/admin/events">Events</Link>
        <Link className="block py-1 hover:underline" href="/admin/projects">Projects</Link>
        <Link className="block py-1 hover:underline" href="/admin/harvest-pledges">Harvest Pledges</Link>
        <Link className="block py-1 hover:underline" href="/admin/history">Parish History</Link>
        {canManageBaptismRecords && (
          <Link className="block py-1 hover:underline" href="/admin/baptism-records">
            Baptism Records
          </Link>
        )}
        {canManageUsers && (
          <Link className="block py-1 hover:underline" href="/admin/users">
            Staff & Roles
          </Link>
        )}
      </aside>
      <div className="flex-1 px-8 py-6">{children}</div>
    </div>
  );
}
