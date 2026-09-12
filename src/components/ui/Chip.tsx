import { Icon, type IconName } from "@/components/ui/Icon";

export type ChipHue = "accent" | "signal" | "brass" | "sky" | "amber";

/**
 * Domain presentation map — slug → icon chip identity.
 * Keys are identifiers, hues stay semantic (never random):
 * accent = primary capability · signal = live/autonomous · brass = curated/
 * governed · sky = data/interface · amber = operational/physical.
 * No user-facing copy lives here.
 */
const bySlug: Record<string, { icon: IconName; hue: ChipHue }> = {
  // Services
  "ai-strategy": { icon: "compass", hue: "accent" },
  "ai-engineering": { icon: "cpu", hue: "signal" },
  automation: { icon: "workflow", hue: "amber" },
  "software-engineering": { icon: "code", hue: "sky" },
  "data-ai-infrastructure": { icon: "database", hue: "brass" },
  security: { icon: "shield", hue: "accent" },
  "ai-operations": { icon: "gauge", hue: "signal" },
  // Solutions
  "ai-agents": { icon: "cpu", hue: "signal" },
  "workflow-automation": { icon: "workflow", hue: "amber" },
  "ai-software": { icon: "code", hue: "sky" },
  "enterprise-ai": { icon: "layers", hue: "accent" },
  "private-ai": { icon: "lock", hue: "brass" },
  "ai-transformation": { icon: "compass", hue: "accent" },
  // Industries
  "financial-services": { icon: "bank", hue: "accent" },
  healthcare: { icon: "health", hue: "signal" },
  manufacturing: { icon: "factory", hue: "amber" },
  retail: { icon: "cart", hue: "sky" },
  logistics: { icon: "truck", hue: "brass" },
  "saas-technology": { icon: "code", hue: "accent" },
  agriculture: { icon: "globe", hue: "signal" },
  education: { icon: "doc", hue: "sky" },
  "real-estate": { icon: "bank", hue: "brass" },
  "professional-services": { icon: "users", hue: "accent" },
  government: { icon: "shield", hue: "brass" },
  energy: { icon: "gauge", hue: "amber" },
};

const fallbackHues: ChipHue[] = ["accent", "signal", "brass", "sky", "amber"];

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
