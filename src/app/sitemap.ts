import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/site-config";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { Database } from "@/types/database";

// Regenerate hourly so newly added events show up without a redeploy.
export const revalidate = 3600;

const STATIC_ROUTES = [
  "",
  "/about",
  "/mass-schedule",
  "/events",
  "/homilies",
  "/organizations",
  "/projects",
  "/harvest",
  "/mass-booking",
  "/baptism-request",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: now,
  }));

  // Cookie-free client: the sitemap is public and has no user session.
  // Events are publicly readable under RLS (events_public_read).
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const events = await safeQuery(
      supabase.from("events").select("id, created_at").returns<{ id: string; created_at: string }[]>()
    );
    for (const event of events ?? []) {
      entries.push({ url: `${siteConfig.siteUrl}/events/${event.id}`, lastModified: new Date(event.created_at) });
    }
  } catch {
    // Supabase not configured — ship the static routes only.
  }

  return entries;
}
