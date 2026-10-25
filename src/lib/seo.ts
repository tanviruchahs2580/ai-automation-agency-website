import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { SOCIAL_IMAGE, socialImageUrl } from "@/lib/social-image";

const FALLBACK_SITE_URL = "http://localhost:3000";

/**
 * Production domain is injected via NEXT_PUBLIC_SITE_URL.
 *
 * When that var is unset we still try to resolve the real origin from the
 * hosting platform's own system variables before falling back to localhost.
 * Vercel exposes both at build time, so a deploy that forgets the env var
 * publishes correct canonicals instead of self-canonicalising every page to
 * localhost (which deindexes the site). `VERCEL_PROJECT_PRODUCTION_URL` is the
 * stable production domain and wins over the per-deployment `VERCEL_URL`;
 * preview URLs are noindexed by Vercel, so canonicalising previews to the
 * production domain is correct there too.
 *
 * Resolution is defensive because this runs at module evaluation during
 * builds where a crash takes the whole deploy down:
 * - unset OR empty/whitespace values are treated as unset (hosting panels
 *   happily save an env var with an empty value)
 * - protocol-less domains get https:// prepended ("vantiqsystems.com" works)
 * - localhost-style hosts keep http://
 * - anything unparseable falls back instead of throwing
 * The result is normalized to a bare origin (no path/query/trailing slash).
 */
export const SITE_URL = (() => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "";
  if (!raw) return FALLBACK_SITE_URL;
  const candidate = /^https?:\/\//i.test(raw)
    ? raw
    : /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(raw)
      ? `http://${raw}`
      : `https://${raw}`;
  try {
    const url = new URL(candidate);
    // The WHATWG parser accepts some single-label junk ("https://ht!tp"
    // parses!). Require a loopback host or a dotted domain before trusting
    // the result; anything else falls back.
    const okHost =
      /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(url.hostname) ||
      /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname);
    return okHost ? url.origin : FALLBACK_SITE_URL;
  } catch {
    return FALLBACK_SITE_URL;
  }
})();

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /**
   * Route of this page's own social card, e.g. `cardPath("insights", slug)`.
   * Omit to use the default brand card.
   *
   * This has to be passed explicitly rather than left to the
   * `opengraph-image` file convention. Next.js *replaces* the accumulated
   * `openGraph` object at each metadata level (`resolve-metadata.js`: it
   * assigns `newResolvedMetadata.openGraph = resolveOpenGraph(...)` rather than
   * deep-merging), so the moment a page returns its own `openGraph` — which
   * every page here must, to set og:url and og:type — the root card attached by
   * the file convention is discarded. That is why 51 of 52 routes shipped with
   * no `og:image` at all and only the homepage had one.
   */
  cardPath?: string;
}

/**
 * Feed autodiscovery descriptor.
 *
 * Set from `buildMetadata` rather than once in the root layout for the same
 * reason as `og:image`: Next replaces (does not deep-merge) each metadata
 * object per level, so a page returning its own `alternates` — which every page
 * must, to set a canonical — drops whatever the layout had put there. Declaring
 * it in the layout alone left the feed, valid and linked from the footer,
 * reachable only by clicking that link: no crawler or feed reader could
 * discover it.
 */
function feedAlternates() {
  return {
    "application/rss+xml": [
      { url: `${SITE_URL}/feed.xml`, title: `${siteConfig.name} — Insights` },
    ],
  };
}

export function buildMetadata({
  title,
  description,
  path,
  ogType = "website",
  publishedTime,
  modifiedTime,
  cardPath,
}: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} — ${siteConfig.shortName}`;
  const image = {
    url: socialImageUrl(SITE_URL, cardPath),
    width: SOCIAL_IMAGE.width,
    height: SOCIAL_IMAGE.height,
    alt: `${fullTitle}${cardPath ? "" : ` — ${siteConfig.tagline}`}`,
  };

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url, types: feedAlternates() },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: ogType,
      images: [image],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

/* ---------- Structured data ---------- */

/** Organization logo, referenced by the Organization and publisher blocks. */
const LOGO = {
  "@type": "ImageObject",
  url: `${SITE_URL}/icons/icon-512.png`,
  width: 512,
  height: 512,
} as const;

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
    logo: LOGO,
    image: socialImageUrl(SITE_URL),
    knowsAbout: [
      "AI engineering",
      "Workflow automation",
      "AI agents",
      "Enterprise AI architecture",
      "Private AI deployment",
      "AI operations",
    ],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: SITE_URL,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
      logo: LOGO,
    },
    url: `${SITE_URL}${input.path}`,
  };
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  /** Byline as displayed on the page. */
  author: string;
  /**
   * `Person` only when `author` is a named individual. A team byline is an
   * Organization: emitting a team name as `Person` tells search engines a human
   * wrote the article, which is a factual misrepresentation in machine-readable
   * form — and it contradicted the team page's own "no ghost authors" rule.
   */
  authorType?: "Organization" | "Person";
  publishedAt: string;
  modifiedAt?: string;
  cardPath?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    /* Required for Article rich results — without an image Google will not
       render the article treatment at all. */
    image: [socialImageUrl(SITE_URL, input.cardPath)],
    author: {
      "@type": input.authorType ?? "Organization",
      name: input.author,
      url: SITE_URL,
    },
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt ?? input.publishedAt,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
      /* Required by Google for article rich results. */
      logo: LOGO,
    },
    mainEntityOfPage: `${SITE_URL}${input.path}`,
  };
}

/**
 * Interactive tools (ROI calculator, readiness assessment) as products.
 *
 * Note on `aggregateRating`: Google's SoftwareApplication rich result asks for
 * `aggregateRating` or `review` in addition to `offers`. Neither is emitted,
 * deliberately — this site has no genuine ratings or reviews, and inventing
 * them to win a rich snippet would be fabricated endorsement data on a site
 * whose stated position is "no hype metrics". The markup below is accurate
 * about what the page is; it is simply not eligible for the rating treatment.
 */
export function softwareJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    description: input.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
      logo: LOGO,
    },
    url: `${SITE_URL}${input.path}`,
  };
}
