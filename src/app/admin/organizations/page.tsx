// Admin: manage Parish Groups & Societies (PRD §5.4 admin features).
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/database";
import { addOrganization, deleteOrganization } from "./actions";
import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminTextarea,
} from "@/components/admin/ui";

export default async function AdminOrganizationsPage() {
  const supabase = await createClient();
  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .order("name")
    .returns<Organization[]>();

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader title="Organizations" description="Parish groups and societies shown on the public site." />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add a group or society</h2>
        <form action={addOrganization} className="mt-4 grid gap-4">
          <div>
            <AdminLabel htmlFor="name">Name</AdminLabel>
            <AdminInput id="name" name="name" required placeholder="Choir" />
          </div>
          <div>
            <AdminLabel htmlFor="description">Description</AdminLabel>
            <AdminTextarea id="description" name="description" rows={2} />
          </div>
          <div>
            <AdminLabel htmlFor="mission">Mission</AdminLabel>
            <AdminTextarea id="mission" name="mission" rows={2} />
          </div>
          <div>
            <AdminLabel htmlFor="meeting_schedule">Meeting schedule</AdminLabel>
            <AdminInput id="meeting_schedule" name="meeting_schedule" placeholder="Sundays after 10am Mass" />
          </div>
          <div>
            <AdminLabel htmlFor="leadership_contacts">Leadership contacts</AdminLabel>
            <AdminInput id="leadership_contacts" name="leadership_contacts" />
          </div>
          <div>
            <AdminLabel htmlFor="how_to_join">How to join</AdminLabel>
            <AdminInput id="how_to_join" name="how_to_join" />
          </div>
          <div>
            <AdminButton type="submit">Add</AdminButton>
          </div>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {!organizations?.length ? (
          <AdminEmptyState>No groups yet.</AdminEmptyState>
        ) : (
          organizations.map((org) => (
            <AdminCard key={org.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-neutral-100">{org.name}</p>
                {org.description && <p className="mt-1 text-sm text-neutral-400">{org.description}</p>}
              </div>
              <form action={deleteOrganization.bind(null, org.id)}>
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
