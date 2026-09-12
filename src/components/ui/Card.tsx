import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Chip, type ChipHue } from "@/components/ui/Chip";
import type { IconName } from "@/components/ui/Icon";
import { DiagramThumb } from "@/components/ui/DiagramThumb";

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

/** Case study card — diagram / eyebrow / industry / title / before-after / footer. */
export function CaseStudyCard({
  eyebrow,
  industry,
  title,
  before,
  after,
  meta,
  href,
  diagramSeed,
}: {
  eyebrow: string;
  industry: string;
  title: string;
  before: string;
  after: string;
  meta?: ReactNode;
  href: string;
  diagramSeed?: string;
}) {
  return (
    <Link href={href} className={cn(shell, "group p-6")}>
      {diagramSeed && (
        <div className="mb-5">
          <DiagramThumb seed={diagramSeed} />
        </div>
      )}
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

/** Insight card — cover pattern / eyebrow / serif title / 2-line dek / byline. */
export function InsightCard({
  eyebrow,
  title,
  dek,
  byline,
  readTime,
  href,
  patternSeed,
  patternHue = "brass",
}: {
  eyebrow: string;
  title: string;
  dek: string;
  byline: string;
  readTime: string;
  href: string;
  patternSeed?: string;
  patternHue?: ChipHue;
}) {
  return (
    <Link href={href} className={cn(shell, "group overflow-hidden p-0")}>
      {patternSeed && <CoverPattern seed={patternSeed} hue={patternHue} />}
      <div className="flex flex-1 flex-col p-6 pt-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="h-card mt-3 font-editorial text-xl">{title}</h3>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {dek}
        </p>
        <p className="mono-label mt-5 border-t border-line pt-4 text-faint">
          {byline} · {readTime}
        </p>
      </div>
    </Link>
  );
}

/** Thin deterministic cover band keyed by tag — decorative, hue-semantic. */
function CoverPattern({ seed, hue }: { seed: string; hue: ChipHue }) {
  const hash = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 13);
  const bars = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const h = Math.max(0, Math.min(40, 10 + ((hash >> (i * 2)) % 22)));
    return { x: 6 + i * 25, h, hot: (hash + i) % 4 === 0 };
  });
  const hueVar =
    hue === "signal"
      ? "var(--color-signal)"
      : hue === "brass"
        ? "var(--color-brass)"
        : hue === "sky"
          ? "var(--color-info)"
          : hue === "amber"
            ? "var(--color-warn)"
            : "var(--color-accent)";
  return (
    <svg
      viewBox="0 0 200 40"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="h-10 w-full border-b border-line"
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={40 - b.h}
          width={9}
          height={b.h}
          rx={2}
          fill={b.hot ? hueVar : "var(--color-line-strong)"}
          opacity={b.hot ? 0.9 : 0.7}
        />
      ))}
    </svg>
  );
}
