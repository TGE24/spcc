"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteImageByUrl, uploadImage } from "@/lib/storage";
import type { HarvestPhoto } from "@/types/database";

// New photos are appended after the current highest sort_order, so moves
// can safely swap distinct, already-unique values (see moveHarvestPhoto).
// Mirrors src/app/admin/hero/actions.ts.
export async function addHarvestPhoto(formData: FormData) {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    redirect(`/admin/harvest-photos?error=${encodeURIComponent("Please choose an image to upload.")}`);
  }

  const uploaded = await uploadImage(image, "harvest");
  if (!uploaded.ok) {
    redirect(`/admin/harvest-photos?error=${encodeURIComponent(uploaded.error)}`);
  }
  const imageUrl = uploaded.url;

  const supabase = await createClient();
  const { data: top } = await supabase
    .from("harvest_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const { error: insertError } = await supabase.from("harvest_photos").insert({
    image_url: imageUrl,
    sort_order: (top?.sort_order ?? -1) + 1,
  });

  revalidatePath("/admin/harvest-photos");
  revalidatePath("/");

  if (insertError) {
    // The file made it into Storage but the row failed — clean up the
    // now-orphaned upload rather than leaving a file nothing points to.
    await deleteImageByUrl(imageUrl);
    redirect(
      `/admin/harvest-photos?error=${encodeURIComponent("Upload succeeded, but saving the photo failed: " + insertError.message)}`
    );
  }
}

export async function deleteHarvestPhoto(id: string) {
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("harvest_photos")
    .delete()
    .eq("id", id)
    .select()
    .single<HarvestPhoto>();

  revalidatePath("/admin/harvest-photos");
  revalidatePath("/");

  // Best-effort — the row is already gone either way; this just keeps the
  // bucket from accumulating files nothing points to anymore.
  if (photo) {
    await deleteImageByUrl(photo.image_url);
  }
}

export async function moveHarvestPhoto(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("harvest_photos")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .returns<{ id: string; sort_order: number }[]>();

  if (!photos) return;
  const index = photos.findIndex((p) => p.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= photos.length) return;

  const current = photos[index];
  const swapWith = photos[swapIndex];

  await Promise.all([
    supabase.from("harvest_photos").update({ sort_order: swapWith.sort_order }).eq("id", current.id),
    supabase.from("harvest_photos").update({ sort_order: current.sort_order }).eq("id", swapWith.id),
  ]);

  revalidatePath("/admin/harvest-photos");
  revalidatePath("/");
}
