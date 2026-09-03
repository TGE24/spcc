import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saint Patrick Parish",
  description: "Mass schedule, homilies, events, and parish life — all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        {/* Scroll-reveal (see components/reveal.tsx) hides content until JS
            marks it visible on scroll-into-view; without JS that never
            happens, so force it visible here instead of losing content. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
