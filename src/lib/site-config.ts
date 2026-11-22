// Single place to edit parish-identity content that appears sitewide.
// Names follow the official brand kit (stpatricks-brand-assets/).
export const siteConfig = {
	parishName: "St. Patrick's Catholic Church",
	parishFullName: "St. Patrick's Catholic Church, Basorun",
	// Public URL of the deployed site — used for canonical links, the
	// sitemap, and social-share previews. Set NEXT_PUBLIC_SITE_URL in prod.
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
