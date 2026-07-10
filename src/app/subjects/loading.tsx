import { SkeletonSubjectGrid } from "@/components/Skeleton";

export default function SubjectsLoading() {
  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-white" />
          <div className="h-4 w-64 animate-pulse rounded-xl bg-white" />
        </div>
        <SkeletonSubjectGrid />
      </div>
    </div>
  );
}
