"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// No confirmation/status email fires here (unlike mass bookings' approve/
// reject) — "contacted"/"closed" reflect a follow-up call or email staff
// have already had directly with the parent, not a decision the parent is
// waiting to hear about. Once the baptism actually takes place, staff
// create the permanent record separately via addBaptismRecord
// (/admin/baptism-records/actions.ts) and then mark this inquiry "closed".
export async function updateInquiryStatus(id: string, status: "pending" | "contacted" | "closed") {
  const supabase = await createClient();

  await supabase.from("baptism_inquiries").update({ status }).eq("id", id);

  revalidatePath("/admin/baptism-inquiries");
}
