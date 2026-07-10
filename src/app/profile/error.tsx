"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">Profile Error</h1>
        <p className="mt-2 text-sm text-text-secondary">{error.message}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
