"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteImageByUrl, uploadImage } from "@/lib/storage";
import type { HeroSlide } from "@/types/database";

// New slides are appended after the current highest sort_order, so moves
// can safely swap distinct, already-unique values (see moveHeroSlide).
export async function addHeroSlide(formData: FormData) {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    redirect(`/admin/hero?error=${encodeURIComponent("Please choose an image to upload.")}`);
  }

  const uploaded = await uploadImage(image, "hero");
  if (uploaded.error) {
    redirect(`/admin/hero?error=${encodeURIComponent(uploaded.error)}`);
  }

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
    image_url: uploaded.url,
    heading,
    subheading,
    sort_order: (top?.sort_order ?? -1) + 1,
  });

  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: string) {
  const supabase = await createClient();
  const { data: slide } = await supabase
    .from("hero_slides")
    .delete()
    .eq("id", id)
    .select()
    .single<HeroSlide>();

  revalidatePath("/admin/hero");
  revalidatePath("/");

  // Best-effort — the row is already gone either way; this just keeps the
  // bucket from accumulating files nothing points to anymore.
  if (slide) {
    await deleteImageByUrl(slide.image_url);
  }
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
