import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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

/** Capability card — eyebrow / title / 3-line description / mono footer. */
export function CapabilityCard({
  eyebrow,
  title,
  description,
  meta,
  href,
  index,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  href?: string;
  index?: string;
}) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        {index && (
          <span className="mono-label text-accent-bright" aria-hidden="true">
            {index}
          </span>
        )}
      </div>
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

/** Case study card — eyebrow / industry / title / before-after row / footer. */
export function CaseStudyCard({
  eyebrow,
  industry,
  title,
  before,
  after,
  meta,
  href,
}: {
  eyebrow: string;
  industry: string;
  title: string;
  before: string;
  after: string;
  meta?: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className={cn(shell, "group p-6")}>
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

/** Insight card — eyebrow / title / 2-line dek / byline + read time. */
export function InsightCard({
  eyebrow,
  title,
  dek,
  byline,
  readTime,
  href,
}: {
  eyebrow: string;
  title: string;
  dek: string;
  byline: string;
  readTime: string;
  href: string;
}) {
  return (
    <Link href={href} className={cn(shell, "group p-6")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="h-card mt-3">{title}</h3>
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
        {dek}
      </p>
      <p className="mono-label mt-5 border-t border-line pt-4 text-faint">
        {byline} · {readTime}
      </p>
    </Link>
  );
}
