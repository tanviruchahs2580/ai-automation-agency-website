export default function RoiCalculatorLoading() {
  return (
    <div className="section-y">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="card-surface animate-pulse p-6 lg:col-span-6">
            <div className="h-3 w-28 rounded bg-surface2" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-1.5 h-3 w-24 rounded bg-surface2" />
                  <div className="h-10 w-full rounded bg-surface2" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="card-surface h-full animate-pulse p-6">
              <div className="h-3 w-28 rounded bg-surface2" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-line bg-surface2 p-4">
                    <div className="h-3 w-16 rounded bg-canvas" />
                    <div className="mt-2 h-6 w-20 rounded bg-canvas" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
