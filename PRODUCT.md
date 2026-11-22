# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Parishioners and visitors** of St. Patrick's Catholic Church, Basorun (Ibadan, Nigeria): check Mass times, homilies, events and parish news; book Mass intentions, request baptisms, RSVP to events, pledge to the harvest.
- **Parish staff** (roles: `super_admin`, `church_staff`, `content_manager`) — parish secretary, priests, media team. They sign in to the admin area **mostly from phones** to manage bookings, requests, events, homepage content and records.

## Product Purpose

The parish's public website plus a staff admin for running parish life online: publish schedules and news, and handle Mass bookings and baptism requests without paper forms.

## Operating Context

- Admin lives at `/admin`, behind Supabase email/password auth and a staff profile check. Staff log in at `/login`.
- Transactional email (booking confirmations, status updates, baptism inquiry confirmations) goes out through Resend.
- Hosted on Vercel; data in Supabase.

## Capabilities and Constraints

- Next.js App Router (v16, `proxy.ts` instead of middleware), Tailwind v4, Supabase SSR auth.
- Admin is role-gated server-side and by database RLS.
- Admin UI is a dark near-black theme, scoped so the public site stays light.

## Brand Commitments

- Official brand kit in `stpatricks-brand-assets/` (not committed; web copies in `public/brand/`): seal, seal-on-dark, emblem, medallion, horizontal and stacked lockups, Celtic-cross mark.
- Palette: St. Patrick Green `#12341D`, Vestment Green `#2F5A34`, Mitre Gold `#B08D47` (decorative only), Antique Gold `#7A5E24` (gold text on light), Light Gold `#D7BA78` (gold text on green), Sage Mist `#DDE0BC`, Parchment `#FAF8EE`, Ink `#16211A`.
- Type: Cinzel (display), Inter (text).
- Logo rules: clear space = ¼ logo height; seal min 120px on screen (emblem below that, mark below 48px); never recolour, stretch, rotate, or place the light seal on busy photos.
- Official name: "St. Patrick's Catholic Church, Basorun".

## Evidence on Hand

Real parish address, phone, email and Facebook in `src/lib/site-config.ts`; brand artwork in `public/brand/`. No testimonials or statistics exist; don't invent any.

## Product Principles

1. Parish first: everything reads as St. Patrick's, Basorun, not a generic template.
2. Staff tools are fast and forgiving on a phone.
3. Email and other side effects never block the core action.
4. Fail closed on auth; fail gracefully on everything else.
