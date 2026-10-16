import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { JsonLd } from "@/components/ui/Accordion";
import {
  SITE_URL,
  organizationJsonLd,
  siteConfig,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: "%s",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Blocking pre-paint script. Sets the theme before first paint so the
          server'd dark markup never flashes for light-theme visitors, and
          records the platform so keyboard-shortcut hints can name a key that
          actually exists on the visitor's keyboard (⌘ vs Ctrl). Single source
          of truth shared with ThemeToggle: localStorage["vantiq-theme"],
          else OS preference, else dark.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem("vantiq-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}d.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}try{document.documentElement.setAttribute("data-platform",/mac|iphone|ipad/i.test(navigator.userAgent)?"mac":"other")}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        {/* Rendered here, not after the footer, so the banner sits near the top
            of both tab order and the accessibility-tree landmark list. It is
            position:fixed, so DOM order does not affect where it paints. */}
        <CookieConsent />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <BackToTop />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
