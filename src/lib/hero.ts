import type { HeroSettings } from "@/types/database";

// Built-in Home page hero copy — what shows until staff set their own
// default in /admin/hero (hero_settings, 0010). Lives outside
// hero-slider.tsx because that's a client module, and the page's
// placeholder hero (a Server Component) needs these values too.
const FALLBACK_HEADING = "Welcome to Our Parish Family";
const FALLBACK_SUBHEADING =
	"A place of worship, community, and spiritual growth. Join us in celebrating faith, love, and service.";

export type HeroCopy = { heading: string; subheading: string };

export function resolveHeroDefaults(settings: HeroSettings | null): HeroCopy {
	return {
		heading: settings?.heading?.trim() || FALLBACK_HEADING,
		subheading: settings?.subheading?.trim() || FALLBACK_SUBHEADING,
	};
}
