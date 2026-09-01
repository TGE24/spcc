// Admin: Staff & Roles (super_admin only). New staff accounts are created
// via the Supabase dashboard (see SETUP.md — there's no public sign-up by
// design); this page is only for changing an existing staff member's role.
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";
import { updateUserRole } from "./actions";

const ROLES: UserRole[] = ["super_admin", "church_staff", "content_manager"];

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
    .returns<Profile[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Staff &amp; Roles</h1>
      <p className="text-sm text-neutral-500 mb-6">
        To add a new staff member, create their account in the Supabase dashboard (Authentication
        → Users) — see SETUP.md. They&rsquo;ll appear here automatically with the default
        content_manager role, and you can promote them below.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {profiles?.map((profile) => (
            <tr key={profile.id} className="border-b">
              <td className="py-2">{profile.full_name}</td>
              <td>{profile.role}</td>
              <td className="text-right">
                <form action={async (formData) => {
                  "use server";
                  await updateUserRole(profile.id, formData.get("role") as UserRole);
                }}>
                  <select name="role" defaultValue={profile.role} className="border rounded px-2 py-1 text-sm mr-2">
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="border rounded px-3 py-1 hover:bg-neutral-50">
                    Save
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {!profiles?.length && (
            <tr>
              <td colSpan={3} className="py-4 text-neutral-400">No staff accounts yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
