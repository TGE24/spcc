// Single place to edit parish-identity content that appears sitewide.
// Names follow the official brand kit (stpatricks-brand-assets/).

// Public URL of the deployed site — used for canonical links, the sitemap,
// social-share previews, and every link/image in outgoing emails.
//  1. NEXT_PUBLIC_SITE_URL, if set (set it to the custom domain in Vercel).
//  2. Otherwise on Vercel, the project's production domain, which Vercel
//     provides automatically (the custom domain once one is assigned).
//  3. Otherwise localhost, for local development.
// Trailing slashes are trimmed so `${siteUrl}/path` never doubles up.
function resolveSiteUrl() {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL;
	if (explicit) return explicit.replace(/\/+$/, "");
	const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
	if (vercel) return `https://${vercel}`;
	return "http://localhost:3000";
}

export const siteConfig = {
	parishName: "St. Patrick's Catholic Church",
	parishFullName: "St. Patrick's Catholic Church, Basorun",
	siteUrl: resolveSiteUrl(),
	// Default social-share preview (WhatsApp, Facebook, X, LinkedIn).
	ogImage: {
		url: "/og-image.jpg",
		width: 1200,
		height: 630,
		alt: "St. Patrick's Catholic Church, Basorun, Ibadan",
	},
	description:
		"Mass times, homilies, events, and parish life at St. Patrick's Catholic Church, Basorun — book a Mass intention, request a baptism, or get involved.",
	address:
		"63, Basorun road, 200258 Ibadan, Oyo State., Ibadan, Nigeria, 200258",
	phones: ["+234 810 660 7928"],
	email: "spccbasorunmedia@gmail.com",
	facebookUrl: "https://www.facebook.com/spccbasorunibadan",
	navLinks: [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About Us" },
		{ href: "/events", label: "Events" },
		{ href: "/mass-schedule", label: "Mass Schedule" },
		{ href: "/projects", label: "Projects" },
	],
};
