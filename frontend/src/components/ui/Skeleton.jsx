import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Skeleton — content-shaped placeholders. Sized to the real layout so the
 * page does not jump when data lands.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={twMerge(
        clsx(
          "animate-[sweep_1.6s_ease-in-out_infinite] rounded-[3px] bg-crete-200",
          className,
        ),
      )}
      aria-hidden="true"
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-crete-200 px-5 py-4 last:border-b-0">
      <Skeleton className="h-10 w-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

export function SkeletonPanel({ rows = 4 }) {
  return (
    <div className="rounded-card border border-crete-300 bg-crete-50 shadow-hairline">
      <div className="border-b border-crete-200 px-5 py-4">
        <Skeleton className="h-3.5 w-32" />
      </div>
      <div className="divide-y divide-crete-200">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-card border border-crete-300 bg-crete-50"
        >
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
