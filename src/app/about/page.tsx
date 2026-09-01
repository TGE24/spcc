// About Us — implemented from Figma node 19:309. Combines two PRD modules
// that the design itself pairs together: Parish History (§5.3) and
// Organizations (§5.4, shown here as a quick-glance pill list linking to the
// full /organizations page for details).
//
// Historical Images Gallery (Milestone 6): there's no DB table for this —
// it's a handful of archival photos, not editable records — so it reuses
// the PlaceholderImage static-slot pattern with four named slots. Staff
// drop files into public/images/about/history-gallery-N.jpg (see
// public/images/README.md); each renders automatically once present, and a
// missing slot just shows its placeholder rather than an empty gap.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { ParishHistory, Organization } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";

const DEFAULT_HISTORY = [
  "Our parish was founded with a deep desire to create a place of worship and community for God's people.",
  "Over the years, we have grown in faith and numbers, expanding our ministries, strengthening our outreach, and building a strong spiritual foundation for future generations.",
  "Today, we continue to uphold the values and traditions that have shaped our journey, while embracing new ways to serve and connect with our community.",
];

const MISSION_POINTS = [
  { title: "Grow in faith", body: "Grow in faith through prayer, teachings, and the sacraments" },
  { title: "Build meaningful relationships", body: "Build meaningful relationships within a loving and supportive community" },
  { title: "Serve others", body: "Serve others through outreach and acts of compassion" },
  { title: "Participate actively", body: "Participate actively in church programs and activities" },
];

const HISTORY_GALLERY_SLOTS = [
  "about/history-gallery-1",
  "about/history-gallery-2",
  "about/history-gallery-3",
  "about/history-gallery-4",
];

export default async function AboutPage() {
  const supabase = await createClient();
  const [history, organizations] = await Promise.all([
    safeQuery(supabase.from("parish_history").select("*").limit(1).maybeSingle<ParishHistory>()),
    safeQuery(supabase.from("organizations").select("*").order("name").returns<Organization[]>()),
  ]);

  const historyParagraphs = history?.content
    ? history.content.split("\n").filter(Boolean)
    : DEFAULT_HISTORY;

  return (
    <main className="flex-1">
      <section className="relative h-[420px] overflow-hidden md:h-[586px]">
        <PlaceholderImage slot="about/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/41" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[60%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">About Our Parish</h1>
          <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
            We are a welcoming Catholic community dedicated to worship, service, and
            spiritual growth. Our parish is a place where faith comes alive, and everyone
            is invited to belong.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 text-center md:px-[100px]">
        <h2 className="text-3xl font-semibold text-[#022914] md:text-4xl">Our History</h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-6 text-lg text-[#022914] md:text-xl">
          {historyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {history?.founding_date && (
            <p className="text-base text-gray-500">
              Founded {new Date(history.founding_date).toLocaleDateString()}
              {history.founding_priest ? ` by ${history.founding_priest}` : ""}
            </p>
          )}
        </div>
        <PlaceholderImage
          slot="about/history"
          label="Church interior photo"
          className="mx-auto mt-10 h-[300px] max-w-3xl rounded-3xl md:h-[500px]"
        />

        {/* Historical Images Gallery (Milestone 6) */}
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {HISTORY_GALLERY_SLOTS.map((slot) => (
            <PlaceholderImage key={slot} slot={slot} label="Archival photo" className="aspect-square rounded-xl" />
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16 md:px-[100px]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            PARISH GROUPS &amp; SOCIETIES
          </h2>
          <p className="mt-5 text-lg text-gray-500 md:text-xl">
            {`Saint Patrick is home to various groups and societies that cater to the diverse interests and needs of our parishioners. Whether you are looking to deepen your faith, serve others, or connect with fellow parishioners, there is a group for you.`}
          </p>
          <Link href="/organizations" className="mt-8 inline-block rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]">
            Join Group
          </Link>
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-4">
          {(organizations && organizations.length > 0
            ? organizations.map((o) => o.name)
            : ["Church Wardens", "Lectors", "Choir", "CYON", "Young Christian Workers (YCW)", "Catholic Men Organization (CMO)", "Catholic Women Organization (CWO)"]
          ).map((name) => (
            <Link
              key={name}
              href="/organizations"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-brand-600 hover:text-brand-600 hover:shadow-sm active:scale-[0.97]"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 md:px-[100px]">
        <p className="text-sm font-semibold text-brand-600">Our Community</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Our parish is more than a place of worship—it is a family.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Through our various groups, ministries, and organizations, we create opportunities
          for every member to find connection and purpose within the church. We encourage
          our members to:
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="space-y-1">
            {MISSION_POINTS.map((point) => (
              <div key={point.title} className="flex gap-6 border-l-4 border-gray-200 py-4 first:border-brand-600">
                <div>
                  <p className="text-lg font-medium text-gray-900">{point.title}</p>
                  <p className="text-gray-500">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
          <PlaceholderImage slot="about/community" label="Community photo" className="h-[350px] rounded-2xl md:h-[514px]" />
        </div>
      </section>

      <section className="px-6 py-16 md:px-[100px]">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-10 text-center md:p-16">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            You Are Always Welcome
          </h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-lg text-gray-500 md:text-xl">
            <p>Whether you are visiting for the first time or looking for a spiritual home, we invite you to join us in worship and fellowship.</p>
            <p>Come as you are, and be part of a community that cares, supports, and grows together in faith.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/organizations" className="rounded-3xl bg-brand-600 px-7 py-5 text-lg text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97]">
              Learn More About Our Programs
            </Link>
            <Link href="/mass-schedule" className="rounded-3xl border border-brand-600 px-7 py-5 text-lg text-brand-600 transition-all duration-200 hover:bg-brand-50 active:scale-[0.97]">
              View Mass Schedule
            </Link>
            <Link href="/organizations" className="rounded-3xl px-7 py-5 text-lg text-brand-600 transition-all duration-200 hover:bg-brand-50 active:scale-[0.97]">
              Join a Group
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
