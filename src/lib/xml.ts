/**
 * XML text escaping for hand-built feeds.
 *
 * Feed content is authored in TypeScript, so it is trusted at runtime but not
 * XML-safe: a title containing "Data & AI" or an angle bracket produces
 * malformed XML and kills the feed for every reader. Escaping at the
 * interpolation point means authors never have to think about it.
 *
 * Escapes the five XML 1.0 predefined entities. `&` must be replaced first,
 * otherwise the ampersands introduced by the later replacements get
 * double-escaped.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
