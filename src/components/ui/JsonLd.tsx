/**
 * Server-rendered JSON-LD injection.
 *
 * Lives in its own module rather than inside `Accordion.tsx`, where it
 * previously sat unrelated to the component it was named after — the root
 * layout had to import an accordion module to emit Organization markup.
 */
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
