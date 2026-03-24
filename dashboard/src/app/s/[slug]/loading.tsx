export default function Loading() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-72 animate-pulse rounded-lg bg-gray-800/60" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-800/40" />
        </div>

        {/* KPI row skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-800/60" />
              <div className="mt-3 h-7 w-28 animate-pulse rounded bg-gray-800/60" />
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800/40" />

        {/* Tabs skeleton */}
        <div className="flex gap-1 rounded-xl bg-gray-900/70 p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-gray-800/60" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-5">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-800/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
