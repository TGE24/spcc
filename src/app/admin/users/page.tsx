// Admin: Staff & Roles (super_admin only). New staff accounts are created
// via the Supabase dashboard (see SETUP.md — there's no public sign-up by
// design); this page is only for changing an existing staff member's role.
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";
import { updateUserRole } from "./actions";
import { AdminButton, AdminCard, AdminPageHeader, AdminSelect, AdminTHead } from "@/components/admin/ui";

const ROLES: UserRole[] = ["super_admin", "church_staff", "content_manager"];

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
    .returns<Profile[]>();

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader
        title="Staff & Roles"
        description="To add a new staff member, create their account in the Supabase dashboard (Authentication → Users) — see SETUP.md. They'll appear here automatically with the default content_manager role, and you can promote them below."
      />

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <AdminTHead>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3" />
            </AdminTHead>
          <tbody className="divide-y divide-white/5">
            {profiles?.map((profile) => (
              <tr key={profile.id}>
                <td className="px-5 py-3 text-neutral-100">{profile.full_name}</td>
                <td className="px-5 py-3 capitalize text-neutral-300">{profile.role}</td>
                <td className="px-5 py-3 text-right">
                  <form
                    action={async (formData) => {
                      "use server";
                      await updateUserRole(profile.id, formData.get("role") as UserRole);
                    }}
                    className="flex items-center justify-end gap-2"
                  >
                    <AdminSelect name="role" defaultValue={profile.role} className="w-auto">
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </AdminSelect>
                    <AdminButton type="submit" variant="subtle">
                      Save
                    </AdminButton>
                  </form>
                </td>
              </tr>
            ))}
            {!profiles?.length && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-neutral-500">
                  No staff accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}
