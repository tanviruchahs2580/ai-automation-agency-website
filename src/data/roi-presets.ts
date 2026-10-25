import { getIndustry } from "@/data/industries";

/**
 * Automation-potential starting assumptions per industry.
 *
 * These are editable starting points for the ROI calculator, not published
 * benchmark data: the calculator page promises "nothing is pulled from thin
 * air or benchmark folklore", so each value is framed as an assumption the
 * visitor can move rather than a sector statistic.
 *
 * They live outside the component because two places need to agree on which
 * industries actually have one. The industry detail pages used to promise
 * "Industry benchmark preset applied" on every sector, while the calculator
 * only recognized six of the twelve — visitors from agriculture, education,
 * real estate, professional services, government and energy were told a preset
 * had been applied and silently received the default instead.
 */

export interface IndustryPreset {
  /** Matches an industry slug from src/data/industries.ts. */
  value: string;
  /**
   * Display label, derived from the industry record rather than retyped here.
   *
   * Written by hand it drifted: this list said "SaaS & technology" while the
   * industry page said "SaaS & Technology", so the same sector appeared under
   * two capitalisations depending on how the visitor arrived. Deriving it means
   * the calculator and the industry page cannot disagree.
   */
  label: string;
  /** Percent of qualifying manual hours assumed automatable. */
  automationRate: number;
}

/**
 * Slugs and starting assumptions. Labels are looked up from `industries` below,
 * and `getIndustry` returns `undefined` for an unknown slug, so a typo fails
 * loudly at module load (which happens during the build, because the calculator
 * page imports this module) instead of silently dropping a preset.
 */
const presetRates = [
  { slug: "financial-services", automationRate: 55 },
  { slug: "healthcare", automationRate: 45 },
  { slug: "manufacturing", automationRate: 60 },
  { slug: "retail", automationRate: 55 },
  { slug: "logistics", automationRate: 60 },
  { slug: "saas-technology", automationRate: 60 },
] as const;

export const industryPresets: readonly IndustryPreset[] = presetRates.map(
  ({ slug, automationRate }) => {
    const industry = getIndustry(slug);
    if (!industry) {
      throw new Error(
        `ROI preset references unknown industry slug "${slug}". Add it to ` +
          `src/data/industries.ts or remove it from src/data/roi-presets.ts.`,
      );
    }
    return { value: slug, label: industry.title, automationRate };
  },
);

/**
 * Shown when no industry is selected (the calculator's own default).
 *
 * Resolved by slug, not by array position. It was `industryPresets[5]`, so the
 * default was whatever happened to sit at index 5 — reordering the list, or
 * removing an entry, silently changed which industry every visitor landed on
 * with no type error and no test failure.
 */
const DEFAULT_PRESET_SLUG = "saas-technology";

export const defaultIndustryPreset: IndustryPreset =
  findIndustryPreset(DEFAULT_PRESET_SLUG) ?? industryPresets[0];

export function hasIndustryPreset(slug: string): boolean {
  return industryPresets.some((preset) => preset.value === slug);
}

export function findIndustryPreset(slug: string): IndustryPreset | undefined {
  return industryPresets.find((preset) => preset.value === slug);
}
