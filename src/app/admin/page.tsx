// Admin dashboard — a real overview instead of a placeholder: at-a-glance
// counts pulled from the same tables the other admin pages manage, each
// linking straight through to where you'd act on it.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCard, AdminPageHeader, AdminSectionLabel } from "@/components/admin/ui";
import {
  CalendarIcon,
  ClipboardCheckIcon,
  ImageStackIcon,
  LeafIcon,
  MegaphoneIcon,
  MicIcon,
} from "@/components/admin/nav-icons";
import type { ReactNode } from "react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: pendingBookings }, { count: upcomingEvents }, { count: pledges }, { count: homilies }] =
    await Promise.all([
      supabase.from("mass_bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", today),
      supabase.from("harvest_pledges").select("*", { count: "exact", head: true }),
      supabase.from("homilies").select("*", { count: "exact", head: true }),
    ]);

  const stats: { label: string; value: number; href: string; icon: ReactNode }[] = [
    { label: "Pending Bookings", value: pendingBookings ?? 0, href: "/admin/mass-bookings", icon: <ClipboardCheckIcon className="size-5" /> },
    { label: "Upcoming Events", value: upcomingEvents ?? 0, href: "/admin/events", icon: <CalendarIcon className="size-5" /> },
    { label: "Harvest Pledges", value: pledges ?? 0, href: "/admin/harvest-pledges", icon: <LeafIcon className="size-5" /> },
    { label: "Homilies Posted", value: homilies ?? 0, href: "/admin/homilies", icon: <MicIcon className="size-5" /> },
  ];

  const quickLinks = [
    { label: "Manage Hero Slider", description: "Add or reorder the Home page hero images.", href: "/admin/hero", icon: <ImageStackIcon className="size-5" /> },
    { label: "Post an Announcement", description: "Show a banner across the top of the Home page.", href: "/admin/announcements", icon: <MegaphoneIcon className="size-5" /> },
    { label: "Review Bookings", description: "Approve or reject pending Mass intentions.", href: "/admin/mass-bookings", icon: <ClipboardCheckIcon className="size-5" /> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of what's happening across the parish site."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <AdminCard className="h-full transition hover:border-white/20 hover:bg-white/[0.05]">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-700/10 text-brand-700">
                {stat.icon}
              </span>
              <p className="mt-4 text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-neutral-400">{stat.label}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <AdminSectionLabel className="mt-10">Quick actions</AdminSectionLabel>
      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <AdminCard className="h-full transition hover:border-white/20 hover:bg-white/[0.05]">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-neutral-300">
                {link.icon}
              </span>
              <p className="mt-4 text-sm font-medium text-white">{link.label}</p>
              <p className="mt-1 text-sm text-neutral-500">{link.description}</p>
            </AdminCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
