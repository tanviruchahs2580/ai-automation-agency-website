export default function Loading() {
  return (
    <div className="container-x section-y" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-3 w-24 rounded bg-surface2" />
        <div className="h-10 w-full rounded bg-surface2" />
        <div className="h-10 w-3/4 rounded bg-surface2" />
        <div className="mt-8 h-4 w-full rounded bg-surface" />
        <div className="h-4 w-5/6 rounded bg-surface" />
      </div>
    </div>
  );
}
