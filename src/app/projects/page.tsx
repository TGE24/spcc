// Parish Projects listing (PRD §5.9) — building/development projects with
// budget details and progress updates, so parishioners can see where
// resources are going.
import { createClient } from "@/lib/supabase/server";
import { safeQuery } from "@/lib/supabase/safe-query";
import type { Project } from "@/types/database";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const projects = await safeQuery(
    supabase.from("projects").select("*").order("created_at", { ascending: false }).returns<Project[]>()
  );

  return (
    <main className="flex-1">
      <section className="relative h-[320px] overflow-hidden md:h-[380px]">
        <PlaceholderImage slot="projects/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Parish Projects</h1>
          <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
            See what we&rsquo;re building together as a community.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        {!projects || projects.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-lg text-gray-500">
            No projects posted yet — check back soon.
          </p>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {projects.map((project, i) => (
              <Reveal
                key={project.id}
                delay={Math.min(i, 5) * 80}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow duration-300 hover:shadow-md md:p-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{project.title}</h2>
                {project.description && (
                  <p className="mt-2 text-sm text-gray-500 md:text-base">{project.description}</p>
                )}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {project.budget_details && (
                    <div>
                      <p className="text-sm font-semibold text-brand-600">Budget</p>
                      <p className="mt-1 text-sm text-gray-600">{project.budget_details}</p>
                    </div>
                  )}
                  {project.progress_update && (
                    <div>
                      <p className="text-sm font-semibold text-brand-600">Progress</p>
                      <p className="mt-1 text-sm text-gray-600">{project.progress_update}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
