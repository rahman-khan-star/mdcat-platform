import { SkeletonLeaderboard } from "@/components/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 animate-pulse rounded-2xl bg-white" />
          <div className="h-8 w-48 animate-pulse rounded-xl bg-white mx-auto" />
          <div className="h-4 w-64 animate-pulse rounded-xl bg-white mx-auto" />
        </div>
        <SkeletonLeaderboard />
      </div>
    </div>
  );
}
