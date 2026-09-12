/**
 * GridLines — faint SVG grid drawn at the viewport edges only.
 * Replaces the old full-bleed `.panel-grid` graph paper: intentional,
 * not decorative. Purely presentational (aria-hidden).
 */
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
      <svg
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <pattern
            id="vantiq-grid"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M72 0H0v72"
              fill="none"
              stroke="var(--color-grid-line)"
              strokeWidth="1"
            />
          </pattern>
          <mask id="vantiq-grid-fade">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x="15%"
              y="0"
              width="70%"
              height="100%"
              fill="black"
              fillOpacity="0.55"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#vantiq-grid)"
          mask="url(#vantiq-grid-fade)"
        />
      </svg>
    </div>
  );
}
