import type { MetadataRoute } from "next";
import { solutions } from "@/data/solutions";
import { services } from "@/data/services";
import { industries } from "@/data/industries";
import { caseStudies } from "@/data/case-studies";
import { insights } from "@/data/insights";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/solutions",
    "/services",
    "/industries",
    "/work",
    "/approach",
    "/technology",
    "/insights",
    "/about",
    "/ai-readiness",
    "/roi-calculator",
    "/start-a-project",
    "/privacy",
    "/terms",
    "/security",
    "/cookie-policy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...solutions.map((s) => ({ path: `/solutions/${s.slug}`, priority: 0.8 })),
    ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.8 })),
    ...industries.map((i) => ({ path: `/industries/${i.slug}`, priority: 0.6 })),
    ...caseStudies.map((c) => ({ path: `/work/${c.slug}`, priority: 0.7 })),
    ...insights.map((i) => ({
      path: `/insights/${i.slug}`,
      priority: 0.6,
      lastModified: new Date(i.publishedAt),
    })),
  ].map<MetadataRoute.Sitemap[number]>((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified:
      "lastModified" in entry ? (entry.lastModified as Date) : now,
    changeFrequency: "monthly",
    priority: entry.priority,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
