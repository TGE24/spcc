// Organizations — full detail listing (PRD §5.4). The About page shows a
// quick-glance pill list of the same data and links here for the rest:
// description, mission, meeting schedule, leadership contacts, how to join.
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { Organization } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const organizations = await safeQuery(
    supabase.from("organizations").select("*").order("name").returns<Organization[]>()
  );

  return (
    <main className="flex-1">
      <section className="relative h-[360px] overflow-hidden md:h-[420px]">
        <PlaceholderImage slot="organizations/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Parish Groups &amp; Societies</h1>
          <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
            Find your place in our community — every group welcomes new members.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-[100px]">
        {!organizations || organizations.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-lg text-gray-500">
            Groups will be listed here once the parish office adds them. In the meantime, ask at
            the parish office about Church Wardens, Lectors, Choir, CYON, Young Christian Workers
            (YCW), Catholic Men Organization (CMO), and Catholic Women Organization (CWO).
          </p>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-8">
            {organizations.map((org) => (
              <div key={org.id} className="rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="text-2xl font-semibold text-gray-900">{org.name}</h2>
                {org.description && <p className="mt-3 text-base text-gray-500">{org.description}</p>}

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {org.mission && (
                    <div>
                      <p className="text-sm font-semibold text-brand-600">Our Mission</p>
                      <p className="mt-1 text-sm text-gray-600">{org.mission}</p>
                    </div>
                  )}
                  {org.meeting_schedule && (
                    <div>
                      <p className="text-sm font-semibold text-brand-600">Meeting Schedule</p>
                      <p className="mt-1 text-sm text-gray-600">{org.meeting_schedule}</p>
                    </div>
                  )}
                  {org.leadership_contacts && (
                    <div>
                      <p className="text-sm font-semibold text-brand-600">Leadership</p>
                      <p className="mt-1 text-sm text-gray-600">{org.leadership_contacts}</p>
                    </div>
                  )}
                  {org.how_to_join && (
                    <div>
                      <p className="text-sm font-semibold text-brand-600">How to Join</p>
                      <p className="mt-1 text-sm text-gray-600">{org.how_to_join}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
