import { Tag } from "@/components/ui/Tag";
import type { Faq } from "@/types/content";

export function Accordion({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-[color:var(--color-line)] overflow-hidden rounded-lg border border-line">
      {items.map((item) => (
        <details key={item.question} className="group bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:text-accent-strong [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className="mono-label shrink-0 text-muted transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="px-5 pb-5 text-sm leading-relaxed text-muted">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

/** Server-rendered JSON-LD injection */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Escape "<" so embedded content can never close the script tag early.
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function ExampleBadge() {
  return (
    <Tag accent>
      Example Architecture — not a client engagement
    </Tag>
  );
}
