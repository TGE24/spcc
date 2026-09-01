// Admin: manage Parish Projects (PRD §5.9 admin features).
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/database";
import { addProject, deleteProject } from "./actions";
import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminTextarea,
} from "@/components/admin/ui";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Project[]>();

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader title="Projects" description="Parish building and community projects." />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add a project</h2>
        <form action={addProject} className="mt-4 grid gap-4">
          <div>
            <AdminLabel htmlFor="title">Title</AdminLabel>
            <AdminInput id="title" name="title" required />
          </div>
          <div>
            <AdminLabel htmlFor="description">Description</AdminLabel>
            <AdminTextarea id="description" name="description" rows={2} />
          </div>
          <div>
            <AdminLabel htmlFor="budget_details">Budget details</AdminLabel>
            <AdminTextarea id="budget_details" name="budget_details" rows={2} />
          </div>
          <div>
            <AdminLabel htmlFor="progress_update">Progress update</AdminLabel>
            <AdminTextarea id="progress_update" name="progress_update" rows={2} />
          </div>
          <div>
            <AdminButton type="submit">Add</AdminButton>
          </div>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {!projects?.length ? (
          <AdminEmptyState>No projects yet.</AdminEmptyState>
        ) : (
          projects.map((project) => (
            <AdminCard key={project.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-neutral-100">{project.title}</p>
                {project.progress_update && (
                  <p className="mt-1 text-sm text-neutral-400">{project.progress_update}</p>
                )}
              </div>
              <form action={deleteProject.bind(null, project.id)}>
                <AdminButton type="submit" variant="danger">
                  Delete
                </AdminButton>
              </form>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}
