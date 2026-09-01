// Admin: manage Parish Projects (PRD §5.9 admin features).
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/database";
import { addProject, deleteProject } from "./actions";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Project[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Projects</h1>

      <form action={addProject} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add a project</h2>
        <input name="title" placeholder="Title" required className="w-full border rounded px-2 py-1" />
        <textarea name="description" placeholder="Description" rows={2} className="w-full border rounded px-2 py-1" />
        <textarea name="budget_details" placeholder="Budget details" rows={2} className="w-full border rounded px-2 py-1" />
        <textarea name="progress_update" placeholder="Progress update" rows={2} className="w-full border rounded px-2 py-1" />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add
        </button>
      </form>

      <ul className="space-y-3 text-sm">
        {projects?.map((project) => (
          <li key={project.id} className="border-b pb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{project.title}</p>
              {project.progress_update && <p className="text-neutral-500">{project.progress_update}</p>}
            </div>
            <form action={deleteProject.bind(null, project.id)}>
              <button className="text-red-600 hover:underline shrink-0">Delete</button>
            </form>
          </li>
        ))}
        {!projects?.length && <li className="text-neutral-400">No projects yet.</li>}
      </ul>
    </div>
  );
}
