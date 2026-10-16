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
 * only recognised six of the twelve — visitors from agriculture, education,
 * real estate, professional services, government and energy were told a preset
 * had been applied and silently received the default instead.
 */

export interface IndustryPreset {
  /** Matches an industry slug from src/data/industries.ts. */
  value: string;
  label: string;
  /** Percent of qualifying manual hours assumed automatable. */
  automationRate: number;
}

export const industryPresets: readonly IndustryPreset[] = [
  { value: "financial-services", label: "Financial services", automationRate: 55 },
  { value: "healthcare", label: "Healthcare", automationRate: 45 },
  { value: "manufacturing", label: "Manufacturing", automationRate: 60 },
  { value: "retail", label: "Retail", automationRate: 55 },
  { value: "logistics", label: "Logistics", automationRate: 60 },
  { value: "saas-technology", label: "SaaS & technology", automationRate: 60 },
] as const;

/** Shown when no industry is selected (the calculator's own default). */
export const defaultIndustryPreset: IndustryPreset = industryPresets[5];

export function hasIndustryPreset(slug: string): boolean {
  return industryPresets.some((preset) => preset.value === slug);
}

export function findIndustryPreset(slug: string): IndustryPreset | undefined {
  return industryPresets.find((preset) => preset.value === slug);
}
