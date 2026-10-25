import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { HydrationSignal } from "@/components/ui/HydrationSignal";
import { JsonLd } from "@/components/ui/JsonLd";
import { siteConfig } from "@/data/site";
import { SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

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
        {/*
          Preload the two faces that paint in the first viewport — the display
          face used by every h1 and the body face. Both are defined in
          globals.css, which is render-blocking, so without this hint the font
          requests are not discovered until CSS has been parsed and the browser
          has matched the first text. The mono face is intentionally not
          preloaded: it is used for labels, not for the largest contentful
          paint, and a third competing request costs more than it saves.
        */}
        <link
          rel="preload"
          href="/fonts/geist-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-tight-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        {/* Rendered here, not after the footer, so the banner sits near the top
            of both tab order and the accessibility-tree landmark list. It is
            position:fixed, so DOM order does not affect where it paints. */}
        <CookieConsent />
        <MotionProvider>
          <Navbar />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <BackToTop />
        <HydrationSignal />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
