export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="h-24 animate-pulse bg-surface" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
              <div className="h-20 w-20 animate-pulse rounded-2xl bg-surface shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-40 animate-pulse rounded bg-surface" />
                <div className="h-4 w-56 animate-pulse rounded bg-surface" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
