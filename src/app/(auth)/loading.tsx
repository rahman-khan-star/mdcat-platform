export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-border">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-xl bg-surface mx-auto" />
            <div className="h-4 w-64 animate-pulse rounded-xl bg-surface mx-auto" />
            <div className="space-y-3 mt-6">
              <div className="h-12 w-full animate-pulse rounded-xl bg-surface" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-surface" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-primary/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
