export default function StartProjectLoading() {
  return (
    <div className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="card-surface mx-auto max-w-2xl animate-pulse p-6 md:p-10">
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-16 rounded bg-surface2" />
              ))}
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-surface2" />
            <div className="mt-8 space-y-5">
              <div className="h-6 w-48 rounded bg-surface2" />
              <div className="h-10 w-full rounded bg-surface2" />
              <div className="h-10 w-full rounded bg-surface2" />
            </div>
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="card-surface animate-pulse p-7">
            <div className="h-3 w-36 rounded bg-surface2" />
            <div className="mt-5 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-5 w-5 rounded bg-surface2" />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-surface2" />
                    <div className="mt-1 h-3 w-48 rounded bg-surface2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
