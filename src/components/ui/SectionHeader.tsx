import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  id?: string;
  /** Section index rendered as a colored `02 /` prefix + hairline rule (v3). */
  index?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
  index,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      <p className="eyebrow mb-4 flex items-center gap-3">
        {index && (
          <span aria-hidden="true" className="font-mono text-accent-bright">
            {index} /
          </span>
        )}
        <span>{eyebrow}</span>
        <span
          aria-hidden="true"
          className={cn(
            "h-px flex-1 bg-gradient-to-r from-line-strong to-transparent",
            align === "center" && "hidden",
          )}
        />
      </p>
      <h2 id={id} className="h-section">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-lg leading-relaxed text-muted">{lead}</p>
      )}
    </Reveal>
  );
}
