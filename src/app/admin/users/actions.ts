"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

// RLS (profiles_super_admin_write) restricts this to super_admin already;
// layout.tsx also only renders the "Staff & Roles" link for super_admin.
export async function updateUserRole(id: string, role: UserRole) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/users");
}
