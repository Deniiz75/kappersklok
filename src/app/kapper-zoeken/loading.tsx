export default function KapperZoekenLoading() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto mt-3 h-5 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
