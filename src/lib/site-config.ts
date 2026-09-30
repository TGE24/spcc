// Single place to edit parish-identity content that appears sitewide.
// "Saint Patrick" is the name used in the Figma design — change it here if
// your parish has a different name; everything else derives from this.
export const siteConfig = {
  parishName: "Saint Patrick",
  parishFullName: "Saint Patrick Parish",
  // Public URL of the deployed site — used for canonical links, the
  // sitemap, and social-share previews. Set NEXT_PUBLIC_SITE_URL in prod.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Mass times, homilies, events, and parish life at Saint Patrick Parish — book a Mass intention, request a baptism, or get involved.",
  address: "21 Oba Akinjobi Way, Basorn Ibadan",
  phones: ["+234 8970-098-1234", "+234 8970-098-1234"],
  email: "infor@saintpatrick.org",
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/events", label: "Events" },
    { href: "/mass-schedule", label: "Mass Schedule" },
    { href: "/harvest", label: "Giving/Donations" },
  ],
};
