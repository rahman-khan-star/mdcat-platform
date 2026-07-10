import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileQuestion className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-6xl font-bold text-text-primary">404</h1>
        <p className="mt-2 text-lg font-medium text-text-primary">
          Page not found
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
