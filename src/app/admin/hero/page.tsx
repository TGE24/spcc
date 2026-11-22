// Admin: manage the Home page hero (Milestone 7 — "hero slider"). One slide
// renders on / exactly like the old static hero; two or more become an
// auto-advancing slideshow (src/components/hero-slider.tsx). Images upload
// straight to Supabase Storage (supabase/migrations/0007_storage.sql,
// src/lib/storage.ts) rather than being pasted-in external links.
// The default headline/subtext (hero_settings) applies to every slide that
// leaves its own blank, and to the placeholder hero before any slides exist.
import { createClient } from "@/lib/supabase/server";
import { resolveHeroDefaults } from "@/lib/hero";
import type { HeroSettings, HeroSlide } from "@/types/database";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminFileInput,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminSectionLabel,
  AdminTextarea,
} from "@/components/admin/ui";
import { addHeroSlide, deleteHeroSlide, moveHeroSlide, saveHeroDefaults } from "./actions";

export default async function AdminHeroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const [{ data: slides }, { data: settings }] = await Promise.all([
    supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .returns<HeroSlide[]>(),
    supabase.from("hero_settings").select("*").limit(1).maybeSingle<HeroSettings>(),
  ]);
  const defaults = resolveHeroDefaults(settings);

  return (
    <div>
      <AdminPageHeader
        title="Hero Slider"
        description="Add one image for a static hero, or several for an auto-advancing slideshow — they appear on the Home page in the order below."
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {saved && <AdminAlert tone="success">Default headline saved — it&rsquo;s live on the Home page.</AdminAlert>}

      <AdminCard className="mb-6">
        <AdminSectionLabel>Default headline</AdminSectionLabel>
        <p className="-mt-2 mb-4 text-sm text-neutral-500">
          Shown on every slide that doesn&rsquo;t set its own headline. Leave a field blank to use the built-in text.
        </p>
        <form action={saveHeroDefaults} className="grid gap-4">
          <input type="hidden" name="id" defaultValue={settings?.id ?? ""} />
          <div>
            <AdminLabel htmlFor="default_heading">Headline</AdminLabel>
            <AdminInput
              id="default_heading"
              name="heading"
              placeholder={resolveHeroDefaults(null).heading}
              defaultValue={settings?.heading ?? ""}
            />
          </div>
          <div>
            <AdminLabel htmlFor="default_subheading">Subtext</AdminLabel>
            <AdminTextarea
              id="default_subheading"
              name="subheading"
              rows={2}
              placeholder={resolveHeroDefaults(null).subheading}
              defaultValue={settings?.subheading ?? ""}
            />
          </div>
          <div>
            <AdminButton type="submit">Save Headline</AdminButton>
          </div>
        </form>
      </AdminCard>

      <AdminCard className="mb-10">
        <AdminSectionLabel>Add a slide</AdminSectionLabel>
        <form action={addHeroSlide} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <AdminLabel htmlFor="image">Image</AdminLabel>
            <AdminFileInput id="image" name="image" accept="image/jpeg,image/png,image/webp,image/gif" required />
            <p className="mt-1.5 text-xs text-neutral-500">JPEG, PNG, WebP, or GIF. Large photos are resized automatically; GIFs must be under 5MB.</p>
          </div>
          <div>
            <AdminLabel htmlFor="heading">Headline for this slide (optional)</AdminLabel>
            <AdminInput id="heading" name="heading" placeholder="Uses the default headline" />
          </div>
          <div>
            <AdminLabel htmlFor="subheading">Subtext for this slide (optional)</AdminLabel>
            <AdminInput id="subheading" name="subheading" placeholder="Uses the default subtext" />
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
                <p className="truncate text-sm font-medium text-white">{slide.heading || defaults.heading}</p>
                <p className="truncate text-sm text-neutral-500">
                  {slide.heading || slide.subheading ? "Custom text for this slide" : "Uses the default headline"}
                </p>
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
