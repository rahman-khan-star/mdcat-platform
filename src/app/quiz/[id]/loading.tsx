export default function QuizDetailLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded-xl bg-white" />
          <div className="h-4 w-32 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="h-3 w-full animate-pulse rounded-full bg-white" />
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-border space-y-4">
          <div className="h-5 w-3/4 animate-pulse rounded bg-surface" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="h-10 w-24 animate-pulse rounded-xl bg-white" />
          <div className="h-10 w-24 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}
