import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./stagger";
import { TEXT_WIDTHS } from "./variable-widths";

export function StatCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const titleW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];
  const valueW = TEXT_WIDTHS[(index + 1) % TEXT_WIDTHS.length];

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className={cn("h-4 rounded", titleW)} style={{ animationDelay: delay }} />
            <Skeleton className="h-8 w-20 rounded" style={{ animationDelay: delay }} />
            <Skeleton className={cn("h-3 rounded max-w-[5rem]", valueW)} style={{ animationDelay: delay }} />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" style={{ animationDelay: delay }} />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardGridSkeleton({
  count = 4,
  className,
  ariaLabel = "Chargement des statistiques",
}: {
  count?: number;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
