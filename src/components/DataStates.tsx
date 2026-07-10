import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-text-secondary">{message}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <span className="text-2xl">!</span>
      </div>
      <p className="mt-4 text-sm font-medium text-text-primary">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-lg text-text-secondary">{message}</p>
    </div>
  );
}
