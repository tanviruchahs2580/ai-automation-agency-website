import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Chip, type ChipHue } from "@/components/ui/Chip";
import type { IconName } from "@/components/ui/Icon";

const shell =
  "card-surface card-pad flex h-full flex-col transition-[border-color,transform,box-shadow]";

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function Meta({ children }: { children: ReactNode }) {
  return (
    <p className="mono-label mt-5 border-t border-line pt-4 text-faint">
      {children}
    </p>
  );
}

/**
 * The spine of a reference architecture, as real content.
 *
 * This replaces a decorative SVG "diagram" that drew four unnamed nodes and a
 * curve seeded from the slug. The audit found the three case-study cards
 * carrying visually identical thumbnails — the seed only nudged node positions
 * by a few pixels — so the motif looked like data without being any, which is
 * worse than no graphic at all on a site whose position is "evidence over
 * hype". These are the architecture's own first layers, so the three cards are
 * now genuinely different from each other and each one tells you something the
 * title does not.
 */
function LayerStack({ layers }: { layers: readonly string[] }) {
  const shown = layers.slice(0, 3);
  const remaining = layers.length - shown.length;

  return (
    <ol className="mb-5 space-y-1.5">
      {shown.map((layer, i) => (
        <li key={layer} className="flex items-baseline gap-2.5">
          <span className="mono-label shrink-0 text-accent-bright" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="truncate text-xs text-muted">{layer}</span>
        </li>
      ))}
      {remaining > 0 && (
        <li className="mono-label ps-[1.6rem] text-faint">
          + {remaining} more {remaining === 1 ? "layer" : "layers"}
        </li>
      )}
    </ol>
  );
}

/** Maps a chip hue to its CSS custom property. */
function hueVar(hue: ChipHue): string {
  switch (hue) {
    case "signal":
      return "var(--color-signal)";
    case "brass":
      return "var(--color-brass)";
    case "sky":
      return "var(--color-info)";
    case "amber":
      return "var(--color-warn)";
    default:
      return "var(--color-accent)";
  }
}

/** Capability card — chip / eyebrow / title / 3-line description / mono footer. */
export function CapabilityCard({
  eyebrow,
  title,
  description,
  meta,
  href,
  index,
  icon,
  hue = "accent",
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  href?: string;
  index?: string;
  icon?: IconName;
  hue?: ChipHue;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <Chip icon={icon} hue={hue} />
        ) : (
          <Eyebrow>{eyebrow}</Eyebrow>
        )}
        {index && (
          <span className="mono-label text-accent-bright" aria-hidden="true">
            {index}
          </span>
        )}
      </div>
      {icon && (
        <div className="mt-4">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <h3 className="h-card mt-3">{title}</h3>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
        {description}
      </p>
      {meta && <Meta>{meta}</Meta>}
    </>
  );
  const cls = cn(shell, "group p-6");
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Case study card — architecture spine / eyebrow / before-after / footer. */
export function CaseStudyCard({
  eyebrow,
  industry,
  title,
  before,
  after,
  layers,
  meta,
  href,
}: {
  eyebrow: string;
  industry: string;
  title: string;
  before: string;
  after: string;
  /** The architecture's own layer labels, shown as the card's spine. */
  layers: readonly string[];
  meta?: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className={cn(shell, "group p-6")}>
      <LayerStack layers={layers} />
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <span className="mono-label text-faint">{industry}</span>
      </div>
      <h3 className="h-card mt-3">{title}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-line bg-surface2 p-3">
          <dt className="mono-label text-faint">Before</dt>
          <dd className="mt-1 text-sm text-muted">{before}</dd>
        </div>
        <div className="rounded-md border border-signal/30 bg-signal/5 p-3">
          <dt className="mono-label text-signal">After</dt>
          <dd className="mt-1 text-sm">{after}</dd>
        </div>
      </dl>
      {meta && <Meta>{meta}</Meta>}
    </Link>
  );
}

/** Insight card — category rule / eyebrow / serif title / 2-line dek / byline. */
export function InsightCard({
  eyebrow,
  title,
  dek,
  byline,
  readTime,
  href,
  categoryHue = "brass",
}: {
  eyebrow: string;
  title: string;
  dek: string;
  byline: string;
  readTime: string;
  href: string;
  /** Hue for the category rule, derived from the article's category. */
  categoryHue?: ChipHue;
}) {
  return (
    <Link href={href} className={cn(shell, "group p-6")}>
      {/*
        A category rule, not a cover pattern. The pattern this replaces was an
        SVG band drawn with `preserveAspectRatio="xMidYMid slice"` inside a
        wider, flatter container, so it scaled up and cropped its own baseline
        and rendered as an empty strip with a stray hairline across it —
        measured as flat luminance across the band, with no bars visible at any
        width. Rather than repair decoration, the card now carries a
        hue-coded rule: it reads at every card width, and the colour states the
        article's category, which is real information.
      */}
      <span
        aria-hidden="true"
        className="mb-4 block h-[3px] w-full rounded-full"
        style={{
          background: `linear-gradient(to right, ${hueVar(categoryHue)}, transparent 72%)`,
        }}
      />
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="h-card-editorial mt-3">{title}</h3>
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
        {dek}
      </p>
      <p className="mono-label mt-5 border-t border-line pt-4 text-faint">
        {byline} · {readTime}
      </p>
    </Link>
  );
}
