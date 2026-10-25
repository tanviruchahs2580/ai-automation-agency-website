/**
 * GridLines — faint engineering grid drawn behind a band of a page.
 *
 * Implemented with repeating CSS gradients and a CSS mask rather than an SVG
 * `<pattern>` + `<mask>` pair, which is what it used to be. Two reasons:
 *
 *  1. The SVG version hard-coded document-level ids (`vantiq-grid`,
 *     `vantiq-grid-fade`) and `GridLines` renders twice on most pages (once in
 *     `PageHero`, once in `CtaSection`), so every page shipped duplicate `id`
 *     attributes — invalid HTML. `url(#id)` resolves to the *first* match in
 *     the document, so the two instances were only accidentally identical: a
 *     change to one would have silently changed the other too.
 *  2. The old pattern was a fixed 72-unit tile scaled with
 *     `preserveAspectRatio="xMidYMid slice"`, so at some viewport sizes the 1px
 *     rules were scaled to uneven widths. CSS gradients always paint at exactly
 *     1 device-independent pixel.
 *
 * The mask holds the grid at full strength near the horizontal edges and fades
 * it to 45% behind the content column, so the band is framed without the rules
 * competing with the type sitting on top of it.
 */

/** Cell size in px — a multiple of the 24px spacing scale. */
const CELL = 72;

const FADE =
  "linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.45) 15%, rgba(0, 0, 0, 0.45) 85%, black 100%)";

export function GridLines({
  className = "",
  opacity = 1,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), " +
            "linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
          maskImage: FADE,
          WebkitMaskImage: FADE,
        }}
      />
    </div>
  );
}
