/**
 * DiagramThumb — mini abstract architecture diagram for case-study cards.
 * Deterministic node layout seeded by slug (stable across renders);
 * one signal-green dash-animated path (pauses under reduced motion via
 * `.diagram-live-path`). Decorative: aria-hidden, card text carries meaning.
 */
export function DiagramThumb({ seed }: { seed: string }) {
  const hash = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const nodes = [0, 1, 2, 3].map((i) => ({
    x: 24 + i * 52 + ((hash >> (i * 3)) % 14),
    y: 22 + ((hash >> (i * 5 + 1)) % 30),
  }));
  const path = `M${nodes[0].x} ${nodes[0].y} C ${nodes[1].x - 18} ${nodes[0].y}, ${nodes[1].x - 18} ${nodes[1].y}, ${nodes[1].x} ${nodes[1].y} S ${nodes[2].x + 10} ${nodes[2].y}, ${nodes[3].x} ${nodes[3].y}`;

  return (
    <svg
      viewBox="0 0 200 64"
      fill="none"
      aria-hidden="true"
      className="h-16 w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x="1"
        y="1"
        width="198"
        height="62"
        rx="10"
        stroke="var(--color-line)"
        strokeWidth="1"
      />
      {nodes.map((n, i) => (
        <line
          key={`g${i}`}
          x1={n.x}
          y1={8}
          x2={n.x}
          y2={56}
          stroke="var(--color-grid-line)"
          strokeWidth="1"
        />
      ))}
      <path
        d={path}
        stroke="var(--color-line-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={path}
        stroke="var(--color-signal)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="diagram-live-path"
      />
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i === 0 || i === 3 ? 4 : 3}
          fill="var(--color-surface2)"
          stroke={i === 3 ? "var(--color-signal)" : "var(--color-accent)"}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
