import type { Metadata } from "next";

/**
 * Production domain is injected via NEXT_PUBLIC_SITE_URL.
 * Until it is configured, canonical URLs resolve to localhost — intentional
 * placeholder behaviour so nothing is published against a domain we do not
 * control yet.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** PLACEHOLDER BRAND — replace with the verified legal entity name before launch. */
export const siteConfig = {
  name: "Meridian AI Engineering",
  shortName: "MERIDIAN",
  tagline: "AI Engineering & Automation for the Enterprise",
  description:
    "We design, engineer and operate intelligent automation systems that connect your people, software, data and workflows — from first architecture to production.",
  locale: "en_US",
} as const;

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}

export function buildMetadata({
  title,
  description,
  path,
  ogType = "website",
  publishedTime,
}: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} — ${siteConfig.shortName}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: ogType,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/* ---------- Structured data ---------- */

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
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
  author: string;
  publishedAt: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    author: { "@type": "Person", name: input.author },
    datePublished: input.publishedAt,
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${SITE_URL}${input.path}`,
  };
}
