import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./stagger";
import { TEXT_WIDTHS } from "./variable-widths";

export function FeedItemSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const line1 = TEXT_WIDTHS[index % TEXT_WIDTHS.length];
  const line2 = TEXT_WIDTHS[(index + 2) % TEXT_WIDTHS.length];

  return (
    <div className="flex items-center gap-3 py-2.5" style={{ animationDelay: delay }}>
      <Skeleton className="h-9 w-9 rounded-full shrink-0" style={{ animationDelay: delay }} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className={cn("h-4 rounded", line1)} style={{ animationDelay: delay }} />
        <Skeleton className={cn("h-3 rounded", line2)} style={{ animationDelay: delay }} />
      </div>
      <Skeleton className="h-3 w-10 rounded shrink-0" style={{ animationDelay: delay }} />
    </div>
  );
}

export function FeedListSkeleton({
  count = 5,
  ariaLabel = "Chargement de l'activité",
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <div className="space-y-1" aria-busy="true" aria-label={ariaLabel}>
      {Array.from({ length: count }).map((_, i) => (
        <FeedItemSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
