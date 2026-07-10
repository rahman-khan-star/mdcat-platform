function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm border border-border ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-3 bg-surface/50 border-b border-border">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="px-6 py-4 border-b border-border/50">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm border border-border ${className}`}>
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-3 w-56 mb-6" />
      <div className="flex items-end gap-2 h-64">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <SkeletonProfile />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <Skeleton className="h-64 w-full" />
        <SkeletonTable rows={5} cols={7} />
      </div>
    </div>
  );
}

export function SkeletonSubjectGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-border">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonQuizGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-sm border border-border">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonLeaderboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4 mt-10">
        {[128, 96, 80].map((h, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-4 w-20 mt-2" />
            <Skeleton className="h-32 w-28 mt-3 rounded-t-xl" style={{ height: h }} />
          </div>
        ))}
      </div>
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
