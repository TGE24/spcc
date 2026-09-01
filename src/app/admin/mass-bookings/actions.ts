"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateBookingStatus(id: string, status: "approved" | "rejected" | "pending") {
  const supabase = await createClient();
  await supabase.from("mass_bookings").update({ status }).eq("id", id);
  revalidatePath("/admin/mass-bookings");
}
