import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  id?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 id={id} className="h-section">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-lg leading-relaxed text-muted">{lead}</p>
      )}
    </Reveal>
  );
}
