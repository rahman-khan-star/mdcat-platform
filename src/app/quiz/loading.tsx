import { SkeletonQuizGrid } from "@/components/Skeleton";

export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-white" />
          <div className="h-4 w-56 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-white" />
          <div className="h-10 w-40 animate-pulse rounded-xl bg-white" />
          <div className="h-10 w-40 animate-pulse rounded-xl bg-white" />
        </div>
        <SkeletonQuizGrid />
      </div>
    </div>
  );
}
