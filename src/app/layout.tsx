import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

// Brand display face (Cinzel, SIL OFL) — self-hosted from the brand kit.
// Exposed as --font-cinzel and wired to the `font-display` utility in
// globals.css.
const cinzel = localFont({
  src: [
    { path: "./fonts/cinzel-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cinzel-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cinzel",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#12341D",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.parishFullName,
    template: `%s | ${siteConfig.parishFullName}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: siteConfig.parishFullName,
    title: siteConfig.parishFullName,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  twitter: { card: "summary_large_image", images: [siteConfig.ogImage.url] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cinzel.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        {/* Scroll-reveal (see components/reveal.tsx) hides content until JS
            marks it visible on scroll-into-view; without JS that never
            happens, so force it visible here instead of losing content. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
