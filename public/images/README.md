# Images

This environment couldn't reach Figma's asset CDN to download the exact
exported photos (network egress here is restricted to package registries —
not a code problem, just where this was built). Everything else about the
design — layout, colors, type, spacing — was implemented from the Figma file
directly.

To add the real photos: open the Figma file, select the image layer, and
**File → Export** (or drag the layer onto your desktop) — Figma exports
locally, so this isn't affected by the same network restriction. Save the
exported file into this folder using these exact names and every page that
references them updates automatically, no code changes needed:

- `home/hero.jpg` — landing page hero background
- `home/mass-intention.jpg` — "Book Mass Intention" card photo
- `home/baptism.jpg` — "Book Baptism" card photo
- `home/harvest-1.jpg`, `home/harvest-2.jpg` — Annual Harvest photos
- `home/logo-crest.png` — the parish crest/logo mark (used in the header/footer instead of the placeholder monogram)

(Subfolders like `home/` need to exist — e.g. `public/images/home/hero.jpg`.)
