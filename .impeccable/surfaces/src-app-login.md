---
version: 1
slug: "src-app-login"
primary_target: "src/app/login"
related_targets: []
---

# Staff login (/login, /login/forgot, /login/reset)

Scope: staff sign-in, password reset request, set-new-password. Mode: Operate.
Audience: parish staff (secretary, priests, media team), mostly on phones. Job: get into /admin fast; recover a forgotten password without calling anyone.
Constraints: dark, closer to the admin than the public site; seal shown whole (brand rules: no crop/recolour, min 120px); same-browser PKCE reset via Supabase.
Concept seed key: 3e82c2f5 (surface, dealt lead: Sanctuary door).

## Direction contract

THESIS: The login is the vestry door: you arrive under the parish seal, and the form rises to meet your thumb. Refuses the centered white card floating on grey.
OWN-WORLD: Green-black ground (#070d09) lit by a St. Patrick Green radial and a faint Mitre Gold halo behind the seal-on-dark. Cinzel in Light Gold for the parish name; Inter for everything you read or type. Sheet surface #0f1812 with hairline white/10 top edge, 28px top radius. Fields are dark wells; focus is a Light Gold ring; CTA is Light Gold with St. Patrick Green text.
STORY: You see St. Patrick's before you see a form; the form says staff only, then gets out of your way.
FIRST VIEWPORT: Phone: seal centered in the upper half with glow, name and "Staff entrance" under it, bottom sheet holding email, password (eye toggle), Forgot password, Sign in, Back to website — all in thumb reach without scrolling at 390x844. Desktop: seal stage left, sheet becomes a floating panel right.
SIGNATURE: On load the seal sharpens out of a soft blur while the sheet rises from the bottom edge, once.
RISK: Glow becoming decoration; keep it a light source behind the seal, not a neon halo.
