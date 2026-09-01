"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// New slides are appended after the current highest sort_order, so moves
// can safely swap distinct, already-unique values (see moveHeroSlide).
export async function addHeroSlide(formData: FormData) {
  const image_url = String(formData.get("image_url") ?? "").trim();
  if (!image_url) return;
  const heading = String(formData.get("heading") ?? "").trim() || null;
  const subheading = String(formData.get("subheading") ?? "").trim() || null;

  const supabase = await createClient();
  const { data: top } = await supabase
    .from("hero_slides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  await supabase.from("hero_slides").insert({
    image_url,
    heading,
    subheading,
    sort_order: (top?.sort_order ?? -1) + 1,
  });

  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: string) {
  const supabase = await createClient();
  await supabase.from("hero_slides").delete().eq("id", id);

  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function moveHeroSlide(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("hero_slides")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .returns<{ id: string; sort_order: number }[]>();

  if (!slides) return;
  const index = slides.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= slides.length) return;

  const current = slides[index];
  const swapWith = slides[swapIndex];

  await Promise.all([
    supabase.from("hero_slides").update({ sort_order: swapWith.sort_order }).eq("id", current.id),
    supabase.from("hero_slides").update({ sort_order: current.sort_order }).eq("id", swapWith.id),
  ]);

  revalidatePath("/admin/hero");
  revalidatePath("/");
}
