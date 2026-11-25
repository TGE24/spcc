---
name: St. Patrick's Catholic Church, Basorun
description: Parish website, staff admin and transactional email for St. Patrick's, Basorun (Ibadan)
colors:
  st-patrick-green: "#12341d"
  vestment-green: "#2f5a34"
  mitre-gold: "#b08d47"
  antique-gold: "#7a5e24"
  light-gold: "#d7ba78"
  sage-mist: "#dde0bc"
  parchment: "#faf8ee"
  parchment-tint: "#f2efdf"
  ink: "#16211a"
  muted-green: "#4b5a4e"
  paper-white: "#ffffff"
  login-ground: "#070d09"
  login-sheet: "#0f1812"
  admin-ground: "#0a0a0a"
  admin-accent: "#009e60"
  admin-accent-deep: "#0a7b3e"
  email-body-text: "#344a3b"
  email-rule: "#ece8d4"
typography:
  display:
    fontFamily: "Cinzel, Trajan Pro, Georgia, serif"
    fontSize: "clamp(2rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Cinzel, Trajan Pro, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Cinzel, Trajan Pro, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  card-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  body-lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  field: "8px"
  field-lg: "12px"
  panel: "16px"
  card: "24px"
  sheet: "28px"
  pill: "9999px"
spacing:
  gutter: "24px"
  gutter-desktop: "100px"
  section-y: "80px"
  section-y-desktop: "112px"
  card-pad: "32px"
components:
  button-primary-on-dark:
    backgroundColor: "{colors.light-gold}"
    textColor: "{colors.st-patrick-green}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-primary-on-dark-hover:
    backgroundColor: "{colors.parchment}"
  button-outline-on-dark:
    textColor: "{colors.parchment}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-primary-on-light:
    backgroundColor: "{colors.st-patrick-green}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.pill}"
    padding: "16px 28px"
  button-primary-on-light-hover:
    backgroundColor: "{colors.vestment-green}"
  card-upcoming-event:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  card-upcoming-event-featured:
    backgroundColor: "{colors.st-patrick-green}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  login-field:
    backgroundColor: "{colors.login-sheet}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.field-lg}"
    height: "48px"
  login-button:
    backgroundColor: "{colors.light-gold}"
    textColor: "{colors.st-patrick-green}"
    rounded: "{rounded.field-lg}"
    height: "48px"
  admin-button-primary:
    backgroundColor: "{colors.admin-accent-deep}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.field}"
    padding: "8px 16px"
  admin-button-primary-hover:
    backgroundColor: "{colors.admin-accent}"
  email-button:
    backgroundColor: "{colors.light-gold}"
    textColor: "{colors.st-patrick-green}"
    rounded: "{rounded.field-lg}"
    padding: "14px 24px"
---

# Design System: St. Patrick's Catholic Church, Basorun

## Overview

**Creative North Star: "Green, Gold and Parchment"**

The system is the parish's own brand kit made into a website: St. Patrick Green, the three golds, Sage Mist and Parchment, Cinzel for proclamation and Inter for everything read or typed. The light public site sits on a warm parchment page; deep green bands and panels carry the parish's voice (hero, priest's message, parish services, footer), and gold appears as hairline rules, a small Latin-cross ornament and the primary call to action on dark ground. It should read as St. Patrick's, Basorun before it reads as a website.

There are four expressions of the one palette. The **public site** is light, generous and calm, with full-bleed tinted or green bands and photo-led heroes under a dark scrim. The **staff login** is a dark "vestry door": a green-black ground lit by a St. Patrick Green wash and a faint Mitre Gold warmth behind the seal-on-dark, with the form in a bottom sheet. The **staff admin** is a neutral near-black working tool that trades brand greens for brighter accent greens so it stays legible. **Transactional email** reuses the public palette in table-safe form: a green header with a 3px Mitre Gold rule, a white card on a parchment-tint page, Light Gold buttons.

Density is low on the public site (80 to 112px section rhythm, 65ch-ish copy measures) and moderate in the admin. Motion is quiet: one entrance per surface, scroll reveals, a gold rule that draws on hover.

**Key Characteristics:**
- Brand palette only on public surfaces; gold has three distinct jobs (Mitre ornament, Antique text on light, Light text on dark).
- Cinzel for parish-voice headings and the hero; Inter for body, UI, card titles and all admin text.
- Full-bleed bands (tint and green) inside a 1440px content cap.
- Soft, generous rounding: pill buttons, 24px cards, 28px login sheet.
- Gold hairline dividers instead of boxed cards wherever content is a list.
- Light surface, dark login and dark admin are scoped so they never leak into each other.

## Colors

A deep liturgical green with three disciplined golds on warm parchment; the dark surfaces are green-black, not grey.

### Primary
- **St. Patrick Green** (`st-patrick-green`): header-over-scroll lockup, footer, the parish services band, the priest's-message panel, the featured upcoming-event card, the email header, CTA text on gold, and the primary button on light ground. The colour of the parish.
- **Vestment Green** (`vestment-green`): hover state for green buttons, links in email, secondary green accents. Never a large field.

### Secondary
- **Mitre Gold** (`mitre-gold`): decorative only: hairline rules and dividers (often at 30 to 70% opacity), the email header's bottom rule, quote marks, ring around the emblem, the harvest step numerals' border. Never body text.
- **Antique Gold** (`antique-gold`): gold text on light backgrounds (the priest's sign-off, small gold links, the email footer's parish name).
- **Light Gold** (`light-gold`): gold text and ornament on dark green or black; the primary CTA fill on dark (hero, login, email); focus rings on dark surfaces; login caret colour.

### Tertiary
- **Sage Mist** (`sage-mist`): selection highlight, hover tint in the mobile menu, tinted chips (the date badge on plain event cards), muted text on green at 75 to 85% opacity.

### Neutral
- **Parchment** (`parchment`): the page background of the public site; headline text on green and on photos.
- **Parchment Tint** (`parchment-tint`): alternating section bands, subtle hovers, the email page background. Replaces cool grey on purpose.
- **Paper White** (`paper-white`): card faces (event cards, the letter panel, RSVP dialog, email card).
- **Ink** (`ink`): body text on light.
- **Muted Green** (`muted-green`): secondary text on light.
- **Login Ground / Login Sheet** (`login-ground`, `login-sheet`): the login's green-black field and its raised sheet. Login secondary text uses green-tinted greys (#c3cdc0 labels, #9fb09c helper text).
- **Admin Ground** (`admin-ground`, Tailwind neutral-950) with white/10 borders and white/3 to white/5 fills; text neutral-100 to neutral-500.
- **Admin Accent / Admin Accent Deep** (`admin-accent`, `admin-accent-deep`): the admin's brighter greens, swapped in by the `admin-theme` scope because the brand greens vanish on near-black. Admin status badges use Tailwind emerald, amber and red at 10% fills.
- **Email body text / Email rule** (`email-body-text`, `email-rule`): email-only paragraph colour and table hairlines (border #e4e0c9 on the card).

### Named Rules
**The Three Golds Rule.** Mitre Gold draws lines, Antique Gold writes on light, Light Gold writes on dark. If gold text sits on parchment or white it is Antique; if on green or black it is Light; Mitre is never text.

**The Warm Neutral Rule.** Neutrals on public surfaces are parchment and its tint, never cool grey slabs. The project remaps Tailwind gray-50 to the parchment tint for this reason.

**The Scoped Dark Rule.** Dark surfaces own their tokens. The admin re-maps `brand-*` inside `.admin-theme`; the login carries its own ground, sheet and selection. Neither touches the public `--background`.

## Typography

**Display Font:** Cinzel (self-hosted, 400 and 700; fallbacks Trajan Pro, Georgia, serif)
**Body Font:** Inter (400, 500, 600, 700 via Fontsource; fallback ui-sans-serif, system-ui)

**Character:** Cinzel is the inscription on the church wall, used for the parish's own voice; Inter is the parish office: plain, readable and quick on a phone.

### Hierarchy
- **Display** (Cinzel 700, 2rem rising to 3.75rem, 1.15): the home hero heading in Parchment over a scrimmed photo, with a soft drop shadow for legibility.
- **Headline** (Cinzel 600 to 700, 1.875rem to 3rem, tight): section headings where the parish speaks (parish services, priest's message, community groups list items at 1.25 to 1.5rem).
- **Title** (Cinzel 600, 1.5 to 1.7rem): column titles in Light Gold on the green services band; ministry names in the community list.
- **Card Title** (Inter 600, 1.5 to 1.75rem, tracking -0.025em): event card titles, RSVP dialog title, admin and login page headings (admin 1.5rem, login 1.625rem).
- **Body** (Inter 400, 1rem, 1.625): paragraphs; leads at 1.125 to 1.25rem. Copy blocks capped around max-w-xl to max-w-2xl.
- **Label** (Inter 500, 0.875rem): nav links, form labels, buttons (600 on gold CTAs). Admin labels drop to 0.75rem neutral-400.

### Named Rules
**The Inscription Rule.** Cinzel is for the parish speaking (hero, section headings, parish names, numerals in ornament); it is never used for form labels, body copy, admin UI or anything a user types.

**The Office Voice Rule.** Everything operational (forms, cards' metadata, admin, login fields) is Inter, sentence case.

## Layout

Public pages cap content at 1440px (`max-w-360`) with 24px gutters on mobile and 100px from `md`. Section rhythm is 80px vertical on mobile, 96 to 112px on desktop. Tinted and green bands paint full-bleed past the cap (a 100vmax spread plus clip-path, or a 100vw pseudo-element where a section overlaps the one above, as the priest's message rises over the hero), without horizontal scroll. The fixed pill header floats 24 to 73px from the top over the hero and tightens to 12 to 16px once scrolled; sub-page heroes are 60vh photo blocks with the title centred near 62% height. Home composes as: photo hero, overlapping priest's-message card, tinted community band, green services band, harvest feature, events, footer.

Lists prefer columns divided by gold hairlines over boxed cards (services in three columns with left borders from `md`, community rows with top and bottom rules). Grids collapse to a single column below `md` (768px) or `lg` (1024px).

The login is phone-first: seal in the upper half, form in a sheet anchored to the bottom edge with safe-area padding, compressing under 760px viewport height; from `lg` it becomes a 1.1fr / 1fr grid with the sheet floating as a 440px panel. The admin is a 256px translucent sidebar beside a scrolling content column.

## Elevation & Depth

A hybrid: the public site is mostly flat colour fields, with soft ambient shadows lifting the few objects that float (the scrolled header, the priest's letter, featured and hovered event cards, the RSVP dialog). Depth on dark surfaces comes from light, not shadow: the login's radial green-and-gold glow and the admin's white/3 fills with a 1px inset top highlight.

### Shadow Vocabulary
- **Header float** (`0 10px 15px -3px rgb(0 0 0 / 0.1)`, Tailwind shadow-lg black/10): the solid pill header and mobile menu.
- **Letter lift** (`0 20px 25px -5px rgb(0 0 0 / 0.1)` plus a 1px Mitre Gold ring at 25%): the priest's-message card.
- **Card hover** (shadow-lg black/5 with a 4px rise): plain upcoming-event cards on hover.
- **Featured glow** (shadow-xl in St. Patrick Green at 20%): the featured upcoming event.
- **Green button shadow** (`0 8px 20px -10px rgba(18,52,29,0.6)`): the green pill CTA on light.
- **Login sheet** (`0 -24px 60px -24px rgba(0,0,0,0.9)` on mobile, `0 30px 80px -30px rgba(0,0,0,0.9)` as a desktop panel).
- **Login CTA glow** (`0 10px 24px -10px rgba(215,186,120,0.55)`).
- **Admin card** (`inset 0 1px 0 0 rgba(255,255,255,0.04)`).

### Named Rules
**The Light Source Rule.** On dark surfaces, glow is a light behind the seal, not a neon halo around controls.

## Shapes

Soft and generous. Buttons on the public site are full pills; cards and the RSVP dialog use 24px corners; the letter card and services list are 24px or square-edged inside full-bleed bands; forms use 8px (older pages) to 12px (RSVP, login) fields. The login sheet has a 28px top radius on phones and 28px all round on desktop. Admin controls use 8px, admin cards 16px, badges full pills. Email cards are 16px with 12px details tables and buttons. Event date badges are 72px-wide 16px-radius tiles. Hairlines (1px, gold at 30 to 70%, or white/10 on dark) do most of the dividing.

## Components

### Buttons
- **Shape:** full pill (9999px) on the public site; 12px on login and email; 8px in admin.
- **Primary on dark:** Light Gold fill, St. Patrick Green text, 14px 28px, Inter 600 0.875rem; hover to Parchment; press scales to 0.97.
- **Outline on dark:** Parchment/50 1px border, Parchment text, slight backdrop blur; hover full border and Parchment/10 fill.
- **Primary on light:** St. Patrick Green pill, Parchment text, green shadow, hover Vestment Green, focus a Mitre Gold 2px outline offset 4px. Older components (RSVP) use the `brand-600` alias with 24px radius and white text, which resolves to the same green.
- **Login:** 48px full-width Light Gold, St. Patrick Green text, gold glow, hover #e3c98c, focus a 4px Light Gold ring at 35%.
- **Admin:** primary accent green with dark shadow; ghost (white/10 border); subtle (text only, white/5 hover); danger (red-400 text link). All show a spinner and disable while pending.

### Cards / Containers
- **Upcoming event card:** white, 1px gray-200 border, 24px radius, 24 to 32px padding, rises 4px with a soft shadow on hover. The next event is filled St. Patrick Green with white text and a white date badge.
- **Date badge:** month in tracked uppercase 0.75rem over a 34px bold tabular day; tones are green, white or Sage tint.
- **Priest's letter:** split panel; green left panel with emblem watermark at 7% opacity, Cinzel heading and a short Mitre Gold bar; white right panel with a Mitre Gold quote mark, a 1.25 to 1.5rem lead in green, Muted Green body, and a gold-rule sign-off.
- **Admin card:** white/3 fill, white/10 border, 16px radius, 20 to 24px padding, inset top highlight.

### Inputs / Fields
- **Public:** white field, gray-300 1px border, 8 to 12px radius; focus to a green border with a green or Sage ring.
- **Login:** 48px dark well (white/4 on the sheet), white/10 border, 12px radius, 1rem text; focus to Light Gold/70 border with a 4px Light Gold/15 ring; autofill forced to a #18221b well; password field has an inline eye toggle.
- **Admin:** white/5 fill, white/10 border, 8px radius, 0.875rem text; focus to accent border with a 2px accent/20 ring.
- **Errors:** public red-50 panel with red-700 text; login a coral-tinted notice (#e5867a at 10 to 30%) with an inline SVG icon; admin red-500/10 alert.

### Navigation
- **Public header:** fixed, centred pill up to 1240px wide. Over the hero it is translucent white/10 with a 2px Mitre Gold/70 border, white links that hover to Light Gold, and the on-dark lockup; past 40px of scroll it cross-fades to white/95 with a hairline border, shadow and the green lockup, links gray-700 hovering to green. Below `md`, a hamburger opens a solid white rounded panel; below `sm` only the emblem shows.
- **Admin sidebar:** grouped links under 11px uppercase neutral-600 group labels; active item marked by a 3px accent bar at the left edge; pending counts in red pill badges.
- **Footer:** St. Patrick Green with white-at-20% column dividers and Light Gold column headings.

### Gold-rule Service Column (signature)
On the green services band, each column is a whole-column link with a Light Gold Cinzel title, a "what happens next" line led by a short Mitre Gold dash, and an underlined CTA with a Light Gold arrow. On hover or focus a 2px Light Gold rule draws across the column's top edge (500ms, cubic-bezier(0.16,1,0.3,1)).

### Hero Ornament (signature)
Under the hero heading: two Light Gold hairlines fading inward toward a small solid Latin cross (inline SVG), the brand's mark reduced to a rule.

### Staff Entrance (signature)
The seal-on-dark (120 to 240px on phones, never below the 120px brand minimum) sharpens out of a 12px blur over 1.1s while the sheet rises 48px over 0.8s, once, both on cubic-bezier(0.16,1,0.3,1).

### Transactional Email
520px white card on a parchment-tint page, 16px radius, #e4e0c9 border. Green header with the horizontal lockup and a 3px Mitre Gold bottom rule; 20px/600 Ink title; 15px/1.6 body; details as a parchment table with hairline rows (muted labels left, 600 Ink values right); full-width Light Gold button; footer with the parish name in Antique Gold. Table-based layout and a system font stack, because email clients strip web fonts.

## Do's and Don'ts

### Do:
- **Do** take every public colour from the `sp-*` tokens; use parchment tint for alternate bands and Sage Mist for light tints.
- **Do** follow the Three Golds Rule: Mitre for lines, Antique for gold text on light, Light for gold text and CTAs on dark.
- **Do** set parish-voice headings in Cinzel and everything operational in Inter.
- **Do** divide lists with 1px gold hairlines inside full-bleed bands rather than boxing each item.
- **Do** keep the seal at 120px or more and show it whole; use the emblem or mark below that.
- **Do** keep admin and login tokens scoped to their containers so the public site stays light.
- **Do** honour reduced motion; the global rule collapses animations and transitions.
- **Do** keep email styling inline and table-based and keep it in step between `src/lib/email-templates.ts` and `supabase/templates/`.

### Don't:
- **Don't** use Mitre Gold for text, or Light Gold on parchment or white.
- **Don't** introduce cool greys or off-palette near-blacks (#1b1919, #111010, #212724, #022914) as public overlays or fields; scrim photos with black at 40 to 60% or the green.
- **Don't** recolour, crop, stretch or rotate the seal or lockups, or place the light seal on busy photos.
- **Don't** use the admin's bright accent greens on public or login surfaces, or the brand greens as admin accents on near-black.
- **Don't** let glow become decoration: one light source behind the seal, not halos on controls.
