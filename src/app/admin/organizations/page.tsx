// Admin: manage Parish Groups & Societies (PRD §5.4 admin features).
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/database";
import { addOrganization, deleteOrganization } from "./actions";

export default async function AdminOrganizationsPage() {
  const supabase = await createClient();
  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .order("name")
    .returns<Organization[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Organizations</h1>

      <form action={addOrganization} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add a group or society</h2>
        <input name="name" placeholder="Name" required className="w-full border rounded px-2 py-1" />
        <textarea name="description" placeholder="Description" rows={2} className="w-full border rounded px-2 py-1" />
        <textarea name="mission" placeholder="Mission" rows={2} className="w-full border rounded px-2 py-1" />
        <input name="meeting_schedule" placeholder="Meeting schedule" className="w-full border rounded px-2 py-1" />
        <input name="leadership_contacts" placeholder="Leadership contacts" className="w-full border rounded px-2 py-1" />
        <input name="how_to_join" placeholder="How to join" className="w-full border rounded px-2 py-1" />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add
        </button>
      </form>

      <ul className="space-y-3 text-sm">
        {organizations?.map((org) => (
          <li key={org.id} className="border-b pb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{org.name}</p>
              {org.description && <p className="text-neutral-500">{org.description}</p>}
            </div>
            <form action={deleteOrganization.bind(null, org.id)}>
              <button className="text-red-600 hover:underline shrink-0">Delete</button>
            </form>
          </li>
        ))}
        {!organizations?.length && <li className="text-neutral-400">No groups yet.</li>}
      </ul>
    </div>
  );
}
