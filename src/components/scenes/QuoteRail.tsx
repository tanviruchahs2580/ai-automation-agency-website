/**
 * QuoteRail — brass vertical rail + editorial pull-quote.
 * Long-form articles only, never landing pages.
 */
export function QuoteRail({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <aside
      aria-label="Pull quote"
      className="my-8 border-l-2 border-brass pl-6"
    >
      <blockquote className="font-editorial text-xl italic leading-relaxed text-ink md:text-2xl">
        “{quote}”
      </blockquote>
      {attribution && (
        <p className="mono-label mt-3 uppercase text-brass">{attribution}</p>
      )}
    </aside>
  );
}
