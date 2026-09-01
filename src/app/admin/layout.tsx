// Role-gated admin shell (PRD §5.11 / tech spec §4.1).
// Every admin route lives under here — auth + role are checked once, server-side,
// on top of the RLS policies that enforce the same rules at the database layer.
//
// Dark "premium" theme: this layout scopes its own bg-neutral-950/text-neutral-100
// rather than touching the global --background/--foreground tokens in
// globals.css, so the public site (which uses this file's layout) stays on
// its light theme untouched.
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { SidebarNav, type NavGroup } from "@/components/admin/sidebar-nav";
import { LogoMark } from "@/components/icons";
import {
  BookIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  DropletIcon,
  ExternalLinkIcon,
  GridIcon,
  HammerIcon,
  ImageStackIcon,
  InboxIcon,
  LeafIcon,
  LogOutIcon,
  MegaphoneIcon,
  MicIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/admin/nav-icons";

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

  const groups: NavGroup[] = [
    { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: <GridIcon /> }] },
    {
      label: "Homepage",
      items: [
        { href: "/admin/hero", label: "Hero Slider", icon: <ImageStackIcon /> },
        { href: "/admin/announcements", label: "Announcements", icon: <MegaphoneIcon /> },
      ],
    },
    {
      label: "Services",
      items: [
        { href: "/admin/mass-schedule", label: "Mass Schedule", icon: <CalendarIcon /> },
        { href: "/admin/mass-bookings", label: "Mass Bookings", icon: <ClipboardCheckIcon /> },
      ],
    },
    {
      label: "Community",
      items: [
        { href: "/admin/organizations", label: "Organizations", icon: <UsersIcon /> },
        { href: "/admin/events", label: "Events", icon: <CalendarIcon /> },
        { href: "/admin/homilies", label: "Homilies", icon: <MicIcon /> },
        { href: "/admin/projects", label: "Projects", icon: <HammerIcon /> },
        { href: "/admin/harvest-pledges", label: "Harvest Pledges", icon: <LeafIcon /> },
      ],
    },
    {
      label: "Records",
      items: [
        { href: "/admin/history", label: "Parish History", icon: <BookIcon /> },
        ...(canManageBaptismRecords
          ? [
              { href: "/admin/baptism-inquiries", label: "Baptism Requests", icon: <InboxIcon /> },
              { href: "/admin/baptism-records", label: "Baptism Records", icon: <DropletIcon /> },
            ]
          : []),
      ],
    },
    ...(canManageUsers
      ? [
          {
            label: "Settings",
            items: [{ href: "/admin/users", label: "Staff & Roles", icon: <ShieldIcon /> }],
          },
        ]
      : []),
  ];

  const initials = profile.full_name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-1 bg-neutral-950 text-neutral-100">
      {/* Subtle brand-tinted wash in the corner — the one deliberately
          decorative touch, kept faint so it never competes with content. */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.15]"
        style={{
          background:
            "radial-gradient(900px circle at 0% 0%, var(--color-brand-600), transparent 60%)",
        }}
      />

      <aside className="relative z-10 flex w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-900/70 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <LogoMark className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Saint Patrick</p>
            <p className="text-xs text-neutral-500">Admin</p>
          </div>
        </div>

        <SidebarNav groups={groups} />

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700/15 text-xs font-semibold text-brand-700">
              {initials || "?"}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-neutral-200">{profile.full_name}</p>
              <p className="truncate text-xs capitalize text-neutral-500">{profile.role.replace("_", " ")}</p>
            </div>
          </div>
          <div className="mt-1 space-y-0.5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-neutral-500 transition hover:bg-white/[0.04] hover:text-neutral-300"
            >
              <ExternalLinkIcon className="size-3.5" />
              View public site
            </Link>
            <form action={signOut}>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-neutral-500 transition hover:bg-white/[0.04] hover:text-neutral-300">
                <LogOutIcon className="size-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
