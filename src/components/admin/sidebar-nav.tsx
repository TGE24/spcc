"use client";
// Client component only for the active-link highlight (needs usePathname).
// Auth / sign-out stays server-side in admin/layout.tsx.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon: ReactNode };
export type NavGroup = { label: string; items: NavItem[] };

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label} className="mb-5 last:mb-0">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-white/[0.07] text-white" : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand-700" />
                  )}
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center ${
                      active ? "text-brand-700" : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
