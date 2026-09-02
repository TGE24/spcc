// Admin: manage the two photos on the Home page's "Annual Harvest
// Celebration" section. Images upload straight to Supabase Storage (see
// supabase/migrations/0007_storage.sql, src/lib/storage.ts) rather than
// being pasted-in external links. Mirrors src/app/admin/hero/page.tsx.
import { createClient } from "@/lib/supabase/server";
import type { HarvestPhoto } from "@/types/database";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminFileInput,
  AdminLabel,
  AdminPageHeader,
  AdminSectionLabel,
} from "@/components/admin/ui";
import { addHarvestPhoto, deleteHarvestPhoto, moveHarvestPhoto } from "./actions";

export default async function AdminHarvestPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("harvest_photos")
    .select("*")
    .order("sort_order", { ascending: true })
    .returns<HarvestPhoto[]>();

  return (
    <div>
      <AdminPageHeader
        title="Harvest Photos"
        description="Only the first two photos below appear on the Home page's Harvest Celebration section. Add, reorder, or delete as needed — any photo could be missing without one, the Home page shows a placeholder in its place."
      />

      <AdminCard className="mb-10">
        <AdminSectionLabel>Add a photo</AdminSectionLabel>
        {error && <AdminAlert>{error}</AdminAlert>}
        <form action={addHarvestPhoto} className="grid gap-4">
          <div>
            <AdminLabel htmlFor="image">Image</AdminLabel>
            <AdminFileInput id="image" name="image" accept="image/jpeg,image/png,image/webp,image/gif" required />
            <p className="mt-1.5 text-xs text-neutral-500">JPEG, PNG, WebP, or GIF — up to 5MB.</p>
          </div>
          <div>
            <AdminButton type="submit">Add Photo</AdminButton>
          </div>
        </form>
      </AdminCard>

      <AdminSectionLabel>
        Current photos {photos && photos.length > 0 && <AdminBadge tone="brand">{photos.length}</AdminBadge>}
      </AdminSectionLabel>

      {photos && photos.length > 0 ? (
        <div className="space-y-3">
          {photos.map((photo, index) => (
            <AdminCard key={photo.id} className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image_url}
                alt=""
                className="h-16 w-24 shrink-0 rounded-lg border border-white/10 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {index < 2 ? "Shown on the Home page" : "Queued (not shown — only the first two display)"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form action={moveHarvestPhoto.bind(null, photo.id, "up")}>
                  <button
                    disabled={index === 0}
                    aria-label="Move up"
                    className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveHarvestPhoto.bind(null, photo.id, "down")}>
                  <button
                    disabled={index === photos.length - 1}
                    aria-label="Move down"
                    className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <form action={deleteHarvestPhoto.bind(null, photo.id)}>
                  <AdminButton variant="danger" className="ml-2">
                    Delete
                  </AdminButton>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <AdminEmptyState>
          No harvest photos yet — the Home page is showing its default placeholder photos.
        </AdminEmptyState>
      )}
    </div>
  );
}
