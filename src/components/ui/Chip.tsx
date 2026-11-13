import { Icon, type IconName } from "@/components/ui/Icon";

export type ChipHue = "accent" | "signal" | "brass" | "sky" | "amber";

/**
 * Domain presentation map — slug → icon chip identity.
 *
 * Hue history: the map originally rotated five hues ("sky = data/interface",
 * "amber = operational/physical", …). The 2026-11 design review correctly
 * called that decoration: a hue code no visitor can decode, importing a blue
 * that exists nowhere else in the Keystone palette. Card chips are now
 * single-hue copper — the card numerals and mono labels already carry the
 * structure, and the accent stays a signal. The hue field and type remain so
 * a future genuinely-semantic use (e.g. state chips) has a home.
 */
const bySlug: Record<string, { icon: IconName; hue: ChipHue }> = {
  // Services
  "ai-strategy": { icon: "compass", hue: "accent" },
  "ai-engineering": { icon: "cpu", hue: "accent" },
  automation: { icon: "workflow", hue: "accent" },
  "software-engineering": { icon: "code", hue: "accent" },
  "data-ai-infrastructure": { icon: "database", hue: "accent" },
  security: { icon: "shield", hue: "accent" },
  "ai-operations": { icon: "gauge", hue: "accent" },
  // Solutions
  "ai-agents": { icon: "cpu", hue: "accent" },
  "workflow-automation": { icon: "workflow", hue: "accent" },
  "ai-software": { icon: "code", hue: "accent" },
  "enterprise-ai": { icon: "layers", hue: "accent" },
  "private-ai": { icon: "lock", hue: "accent" },
  "ai-transformation": { icon: "compass", hue: "accent" },
  // Industries
  "financial-services": { icon: "bank", hue: "accent" },
  healthcare: { icon: "health", hue: "accent" },
  manufacturing: { icon: "factory", hue: "accent" },
  retail: { icon: "cart", hue: "accent" },
  logistics: { icon: "truck", hue: "accent" },
  "saas-technology": { icon: "code", hue: "accent" },
  agriculture: { icon: "globe", hue: "accent" },
  education: { icon: "doc", hue: "accent" },
  "real-estate": { icon: "bank", hue: "accent" },
  "professional-services": { icon: "users", hue: "accent" },
  government: { icon: "shield", hue: "accent" },
  energy: { icon: "gauge", hue: "accent" },
};

const fallbackHues: ChipHue[] = ["accent"];

export function chipFor(slug: string, index = 0): { icon: IconName; hue: ChipHue } {
  return (
    bySlug[slug] ?? {
      icon: "layers" as IconName,
      hue: fallbackHues[index % fallbackHues.length],
    }
  );
}

export function Chip({
  icon,
  hue,
  label,
}: {
  icon: IconName;
  hue: ChipHue;
  label?: string;
}) {
  return (
    <span className="chip" data-hue={hue} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <Icon name={icon} size={20} />
    </span>
  );
}
