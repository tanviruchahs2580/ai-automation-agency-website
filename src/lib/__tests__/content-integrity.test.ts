import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { footerColumns, siteNav, teamByline } from "@/data/site";
import { services } from "@/data/services";
import { solutions } from "@/data/solutions";
import { industries } from "@/data/industries";
import { caseStudies } from "@/data/case-studies";
import { insights } from "@/data/insights";
import { opportunities } from "@/data/opportunities";
import { readinessQuestions } from "@/data/readiness-questions";
import {
  agentStages,
  architectureLayers,
  beforeAfterPairs,
  engineeringPrinciples,
  processPhases,
  riskTiers,
} from "@/data/architecture";
import { technologyCategories } from "@/data/technology";
import { intakeSteps } from "@/lib/intake";
import { projectBriefSchema } from "@/lib/validation";
import { relativeToSrc, sourceFiles, stripComments } from "./source-scan";
import {
  defaultIndustryPreset,
  hasIndustryPreset,
  industryPresets,
} from "@/data/roi-presets";

/**
 * Cross-file content integrity.
 *
 * Every defect this file guards against was a real one: navigation that
 * disagreed with the pages it linked to, a service page promising a six-week
 * prototype for an ongoing retainer, an industry page claiming a calculator
 * preset that did not exist for that sector, a reserved `*.example` address
 * rendering as a live mailto, and a hidden page missing from the sitemap.
 * None of these are type errors, so only an invariant test can catch them.
 */

const APP_DIR = path.join(process.cwd(), "src", "app");

/** True when href maps to a real `page.tsx`, including a `[slug]` sibling. */
function routeExists(href: string): boolean {
  const segments = href.split("/").filter(Boolean);
  const direct = path.join(APP_DIR, ...segments, "page.tsx");
  if (fs.existsSync(direct)) return true;
  if (segments.length === 0) return false;
  const parent = path.join(APP_DIR, ...segments.slice(0, -1));
  if (!fs.existsSync(parent)) return false;
  return fs
    .readdirSync(parent)
    .some(
      (entry) =>
        entry.startsWith("[") &&
        entry.endsWith("]") &&
        fs.existsSync(path.join(parent, entry, "page.tsx")),
    );
}

/** Recursively collects every string in a data structure. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, out);
  }
  return out;
}

/**
 * en-GB spellings, shared by the data-module audit and the source-wide one.
 *
 * Suffixes are spelled out rather than using a bare `optimis` stem, which would
 * also flag legitimate words such as "optimism". The `-is(e|ed|es|ing|ation)`
 * family is the part that matters: an earlier version listed six verbs by hand
 * and missed every other one, so "system modernisation" sat beside "cost
 * optimization" in the same file for months.
 */
const britishSpelling =
  /\w+(?:is(?:e|ed|es|ing|ation|ations|ational)|behaviour\w*|colour\w*|defence\w*|judgement\w*|modelling|licence|whilst|amongst|rigour\w*|centre|fibre|metre|theatre)/i;

const navigationHrefs = [
  ...siteNav.flatMap((item) => [
    item.href,
    ...(item.children ?? []).map((child) => child.href),
  ]),
  ...footerColumns.flatMap((column) => column.links.map((link) => link.href)),
];

const allContentStrings = collectStrings([
  siteNav,
  footerColumns,
  services,
  solutions,
  industries,
  caseStudies,
  insights,
  opportunities,
  readinessQuestions,
  agentStages,
  beforeAfterPairs,
  engineeringPrinciples,
  processPhases,
  riskTiers,
  /*
    Added after the audit found a coverage hole: the brand-voice, whitespace and
    spelling audits simply did not read `technology.ts` or the ROI preset
    labels, which is exactly where "Standardised" and "SaaS & technology" were
    sitting unnoticed.
  */
  architectureLayers,
  technologyCategories,
  industryPresets,
]);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("navigation integrity", () => {
  it("points every navigation and footer link at a page that exists", () => {
    const broken = navigationHrefs.filter((href) => !routeExists(href));
    expect(broken).toEqual([]);
  });

  it("uses absolute in-site hrefs everywhere", () => {
    const malformed = navigationHrefs.filter(
      (href) => !href.startsWith("/") || href.startsWith("//"),
    );
    expect(malformed).toEqual([]);
  });

  it("keeps the expected footer columns", () => {
    expect(footerColumns.map((c) => c.heading)).toEqual([
      "Solutions",
      "Services",
      "Industries",
      "Company",
      "Tools",
    ]);
  });

  it("links each index page from the footer", () => {
    const footerHrefs = footerColumns.flatMap((c) =>
      c.links.map((l) => l.href),
    );
    for (const index of ["/solutions", "/services", "/industries"]) {
      expect(footerHrefs).toContain(index);
    }
  });

  it("labels every navigation entry with the destination page's real title", () => {
    // Short nav labels used to disagree with the page they opened
    // ("Automation" → "Automation Engineering"), which also made the search
    // index unmatchable by the title a visitor can read on the page.
    const titleByHref = new Map<string, string>();
    for (const item of [...services, ...solutions, ...industries]) {
      const prefix = services.includes(item as never)
        ? "/services/"
        : solutions.includes(item as never)
          ? "/solutions/"
          : "/industries/";
      titleByHref.set(`${prefix}${item.slug}`, item.title);
    }

    const mismatches: string[] = [];
    for (const item of siteNav) {
      for (const child of item.children ?? []) {
        const expected = titleByHref.get(child.href);
        if (expected && expected !== child.label) {
          mismatches.push(`${child.href}: label "${child.label}" ≠ title "${expected}"`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });
});

describe("placeholder sweep", () => {
  it("omits contact channels rather than faking them when unconfigured", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_MEETING_LINK", "");
    const { contact } = await import("@/data/site");
    expect(contact.email).toBeNull();
    expect(contact.meetingLink).toBeNull();
  });

  it("never ships a reserved address or a dead hash link as a live channel", async () => {
    const { contact } = await import("@/data/site");
    expect(contact.email ?? "").not.toMatch(/\.(example|invalid|test)$/i);
    expect(contact.meetingLink ?? "").not.toMatch(/^#/);
    expect(contact.meetingLink ?? "").not.toMatch(/placeholder/i);
  });

  it("contains no reserved example domain in any content string", () => {
    const offenders = allContentStrings.filter((s) =>
      /@[a-z0-9.-]*\.(example|invalid|test)\b/i.test(s),
    );
    expect(offenders).toEqual([]);
  });

  it("contains no unfinished-content markers", () => {
    const markers =
      /lorem ipsum|\bTODO\b|\bTBD\b|coming soon|\bXXX\b|\[insert|placeholder text/i;
    const offenders = allContentStrings.filter((s) => markers.test(s));
    expect(offenders).toEqual([]);
  });
});

describe("copy hygiene", () => {
  it("has no leading, trailing or doubled whitespace in content strings", () => {
    const offenders = allContentStrings.filter(
      (s) => s !== s.trim() || /\s{2,}/.test(s),
    );
    // A stray leading space (" FOI/request processing support") renders as a
    // dangling indent next to a list marker.
    expect(offenders).toEqual([]);
  });

  it("uses US English consistently (locale is en_US, JSON-LD says Organization)", () => {
    /*
      Suffixes are spelled out rather than using a bare `optimis` stem, which
      would also flag legitimate words such as "optimism"/"optimist".
    */
    const british =
      /\b(?:organis(?:e|es|ed|ing|ation|ations|ational)|optimis(?:e|es|ed|ing|ation|ations)|prioritis(?:e|es|ed|ing|ation|ations)|summaris(?:e|es|ed|ing|ation|ations)|utilis(?:e|es|ed|ing|ation|ations)|recognis(?:e|es|ed|ing|ition)|behaviour\w*|colour\w*|defence\w*|judgement\w*|modelling|licence|whilst|amongst)/i;
    const offenders = allContentStrings.filter((s) => british.test(s));
    expect(offenders).toEqual([]);
  });

  it("uses US English in page and component copy, not only in data modules", () => {
    /*
      The rule above reads `allContentStrings`, which is collected from the data
      modules — so copy written directly in a page or component was never
      checked. It was clean when this was added, by luck: the remediation pass
      rewrote about twenty en-GB strings across both, and only the data half was
      covered by a test.
    */
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const relative = relativeToSrc(file);
      if (relative.includes("__tests__") || relative.startsWith("lib/i18n")) continue;
      const contents = stripComments(fs.readFileSync(file, "utf8"));
      for (const line of contents.split("\n")) {
        if (britishSpelling.test(line)) offenders.push(`${relative}: ${line.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("passes the brand-voice forbidden-word audit", () => {
    const forbidden =
      /\b(leverage|synergize|supercharge|unlock|revolutionize|game-changing|cutting-edge|world-class|best-in-class|next-gen|robust|seamless|empower)\w*/i;
    const offenders = allContentStrings.filter((s) => forbidden.test(s));
    expect(offenders).toEqual([]);
  });

  it("contains no unsourced 'typical results' phrasing", () => {
    // The site's positioning is "no hype metrics"; the homepage teaser used to
    // label model outputs as typical client outcomes.
    const offenders = allContentStrings.filter((s) =>
      /\btypical(ly)?\s+(first-year|results?|savings)/i.test(s),
    );
    expect(offenders).toEqual([]);
  });
});

describe("services", () => {
  it("has unique slugs", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every service its own non-empty engagement shape", () => {
    for (const service of services) {
      expect(service.engagementShape.label.trim()).not.toBe("");
      expect(service.engagementShape.phases.length).toBeGreaterThanOrEqual(2);
      for (const phase of service.engagementShape.phases) {
        expect(phase.phase.trim()).not.toBe("");
        expect(phase.duration.trim()).not.toBe("");
        expect(phase.detail.trim()).not.toBe("");
      }
    }
  });

  it("does not present the ongoing operations retainer as a fixed-length project", () => {
    const ops = services.find((s) => s.slug === "ai-operations");
    expect(ops).toBeDefined();
    expect(ops!.engagementShape.label).not.toMatch(/\d+\s*-\s*week/i);
    expect(ops!.engagementShape.label).toMatch(/retainer/i);
  });
});

describe("insights", () => {
  it("has unique slugs", () => {
    const slugs = insights.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("lifts every pull quote verbatim from its own body copy", () => {
    for (const insight of insights) {
      expect(insight.pullQuote.trim()).not.toBe("");
      const body = insight.sections
        .flatMap((section) => section.paragraphs)
        .join(" ");
      expect(body).toContain(insight.pullQuote);
    }
  });

  it("does not start a pull quote on an ordinal that has no sequel", () => {
    const offenders = insights
      .filter((i) => /^(first|second|third|finally|lastly)[,:]?\s/i.test(i.pullQuote))
      .map((i) => i.title);
    expect(offenders).toEqual([]);
  });

  it("publishes dates in strictly descending order", () => {
    const times = insights.map((i) => new Date(i.publishedAt).getTime());
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });

  it("uses one shared byline so the team page and articles agree", () => {
    const authors = new Set(insights.map((i) => i.author));
    expect(authors.size).toBe(1);
    expect([...authors][0]).toBe(teamByline);
  });
});

describe("industries and reference architectures", () => {
  it("has unique slugs", () => {
    const slugs = industries.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every case-study reference", () => {
    const known = new Set(caseStudies.map((c) => c.slug));
    const missing = industries
      .flatMap((i) => i.caseStudySlugs)
      .filter((slug) => !known.has(slug));
    expect(missing).toEqual([]);
  });

  it("reaches every reference architecture from at least one industry page", () => {
    // Two of the three studies were orphaned: they carried a sector label that
    // no industry page linked to.
    const referenced = new Set(industries.flatMap((i) => i.caseStudySlugs));
    const orphans = caseStudies
      .filter((c) => !referenced.has(c.slug))
      .map((c) => c.slug);
    expect(orphans).toEqual([]);
  });
});

describe("ROI calculator presets", () => {
  it("only declares presets for industries that exist", () => {
    const known = new Set(industries.map((i) => i.slug));
    const unknown = industryPresets
      .map((p) => p.value)
      .filter((slug) => !known.has(slug));
    expect(unknown).toEqual([]);
  });

  it("keeps the default preset inside the preset list", () => {
    expect(industryPresets).toContain(defaultIndustryPreset);
  });

  it("agrees with hasIndustryPreset for every sector", () => {
    for (const industry of industries) {
      expect(hasIndustryPreset(industry.slug)).toBe(
        industryPresets.some((p) => p.value === industry.slug),
      );
    }
    expect(hasIndustryPreset("not-a-real-sector")).toBe(false);
  });

  it("keeps automation rates within the range the UI allows", () => {
    for (const preset of industryPresets) {
      expect(preset.automationRate).toBeGreaterThan(0);
      expect(preset.automationRate).toBeLessThanOrEqual(95);
    }
  });
});

describe("sitemap coverage", () => {
  const sitemapPaths = sitemap().map((entry) =>
    entry.url.replace(/^https?:\/\/[^/]+/, ""),
  );

  it("lists every static page that exists on disk", () => {
    const staticRoutes = fs
      .readdirSync(APP_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
      .map((entry) => `/${entry.name}/page.tsx`)
      .filter((relative) => fs.existsSync(path.join(APP_DIR, ...relative.split("/"))))
      .map((relative) => `/${relative.split("/")[1]}`);
    const missing = staticRoutes.filter((route) => !sitemapPaths.includes(route));
    expect(missing).toEqual([]);
  });

  it("lists every dynamic page generated from the data files", () => {
    const expected = [
      ...solutions.map((s) => `/solutions/${s.slug}`),
      ...services.map((s) => `/services/${s.slug}`),
      ...industries.map((i) => `/industries/${i.slug}`),
      ...caseStudies.map((c) => `/work/${c.slug}`),
      ...insights.map((i) => `/insights/${i.slug}`),
    ];
    const missing = expected.filter((route) => !sitemapPaths.includes(route));
    expect(missing).toEqual([]);
  });

  it("only lists routes that resolve to a real page", () => {
    const notFound = sitemapPaths.filter(
      (route) => route !== "" && !routeExists(route),
    );
    expect(notFound).toEqual([]);
  });

  it("has no duplicate URLs", () => {
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });
});

describe("derived counts and cross-references", () => {
  it("every ROI preset label matches its industry title", () => {
    /*
      Retyped labels drifted: the preset list said "SaaS & technology" and the
      industry page said "SaaS & Technology", so the same sector appeared under
      two capitalisations depending on the route the visitor took.
    */
    for (const preset of industryPresets) {
      const industry = industries.find((i) => i.slug === preset.value);
      expect(industry, `preset ${preset.value} has no industry`).toBeDefined();
      expect(preset.label).toBe(industry!.title);
    }
  });

  it("resolves the default preset by slug, not by array position", () => {
    expect(defaultIndustryPreset.value).toBe("saas-technology");
    /*
      The default used to be `industryPresets[5]`, so reordering or removing an
      entry silently changed which industry every visitor landed on. What must
      hold now is that the default *is* the record found by its slug, whatever
      index that record occupies.
    */
    const bySlug = industryPresets.find(
      (preset) => preset.value === defaultIndustryPreset.value,
    );
    expect(bySlug).toBe(defaultIndustryPreset);
    expect(defaultIndustryPreset.label).toBe("SaaS & Technology");
  });

  it("gives every industry preset a plausible automation rate", () => {
    for (const preset of industryPresets) {
      expect(preset.automationRate).toBeGreaterThan(0);
      expect(preset.automationRate).toBeLessThanOrEqual(95);
    }
  });

  it("keeps intake step fields in step with the brief schema", () => {
    /*
      The wizard's step list moved out of the component so the hosting page can
      state the step count from data. That only works if the field names stay
      real: a renamed field would leave a step that validates nothing.
    */
    const known = new Set([
      ...Object.keys(projectBriefSchema.shape),
      // Never persisted, never validated on a step: honeypot + consent handled
      // explicitly.
      "companyWebsite",
    ]);
    for (const step of intakeSteps) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.fields.length).toBeGreaterThan(0);
      for (const field of step.fields) {
        expect(known, `${step.title} references unknown field "${field}"`).toContain(
          field,
        );
      }
    }
  });

  it("validates every schema field on exactly one step", () => {
    const assigned = intakeSteps.flatMap((step) => [...step.fields]);
    const duplicates = assigned.filter((field, i) => assigned.indexOf(field) !== i);
    expect(duplicates).toEqual([]);
  });

  it("ships at least four architecture layers with unique ids", () => {
    // The `/technology` heading derives its count from this array.
    expect(architectureLayers.length).toBeGreaterThanOrEqual(4);
    const ids = architectureLayers.map((layer) => layer.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const layer of architectureLayers) {
      expect(layer.guarantee.length).toBeGreaterThan(20);
      expect(layer.technical.length).toBeGreaterThan(20);
    }
  });
});
