// Admin: manage the Home page hero (Milestone 7 — "hero slider"). One slide
// renders on / exactly like the old static hero; two or more become an
// auto-advancing slideshow (src/components/hero-slider.tsx). Images are
// hosted-link references, same pattern as event photos and homily audio —
// there's no Storage upload pipeline in V1.
import { createClient } from "@/lib/supabase/server";
import type { HeroSlide } from "@/types/database";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminSectionLabel,
} from "@/components/admin/ui";
import { addHeroSlide, deleteHeroSlide, moveHeroSlide } from "./actions";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true })
    .returns<HeroSlide[]>();

  return (
    <div>
      <AdminPageHeader
        title="Hero Slider"
        description="Add one image for a static hero, or several for an auto-advancing slideshow — they appear on the Home page in the order below."
      />

      <AdminCard className="mb-10">
        <AdminSectionLabel>Add a slide</AdminSectionLabel>
        <form action={addHeroSlide} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <AdminLabel htmlFor="image_url">Image URL</AdminLabel>
            <AdminInput id="image_url" name="image_url" type="url" placeholder="https://..." required />
          </div>
          <div>
            <AdminLabel htmlFor="heading">Headline (optional)</AdminLabel>
            <AdminInput id="heading" name="heading" placeholder="Welcome to Our Parish Family" />
          </div>
          <div>
            <AdminLabel htmlFor="subheading">Subtext (optional)</AdminLabel>
            <AdminInput id="subheading" name="subheading" placeholder="A place of worship, community..." />
          </div>
          <div className="md:col-span-2">
            <AdminButton type="submit">Add Slide</AdminButton>
          </div>
        </form>
      </AdminCard>

      <AdminSectionLabel>
        Current slides {slides && slides.length > 0 && <AdminBadge tone="brand">{slides.length}</AdminBadge>}
      </AdminSectionLabel>

      {slides && slides.length > 0 ? (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <AdminCard key={slide.id} className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image_url}
                alt=""
                className="h-16 w-24 shrink-0 rounded-lg border border-white/10 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{slide.heading || "(uses default headline)"}</p>
                <p className="truncate text-sm text-neutral-500">{slide.subheading || "(uses default subtext)"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form action={moveHeroSlide.bind(null, slide.id, "up")}>
                  <button
                    disabled={index === 0}
                    aria-label="Move up"
                    className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveHeroSlide.bind(null, slide.id, "down")}>
                  <button
                    disabled={index === slides.length - 1}
                    aria-label="Move down"
                    className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <form action={deleteHeroSlide.bind(null, slide.id)}>
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
          No hero slides yet — the Home page is showing its default placeholder hero.
        </AdminEmptyState>
      )}
    </div>
  );
}
