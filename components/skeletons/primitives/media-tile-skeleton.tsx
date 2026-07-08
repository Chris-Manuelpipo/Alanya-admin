import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./stagger";
import { TEXT_WIDTHS } from "./variable-widths";

export function MediaTileSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const nameW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" style={{ animationDelay: delay }} />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className={cn("h-4 rounded", nameW)} style={{ animationDelay: delay }} />
            <Skeleton className="h-3 w-28 rounded" style={{ animationDelay: delay }} />
            <Skeleton className="h-3 w-24 rounded" style={{ animationDelay: delay }} />
            <div className="flex items-center gap-2 pt-0.5">
              <Skeleton className="h-5 w-14 rounded-full" style={{ animationDelay: delay }} />
              <Skeleton className="h-3 w-16 rounded" style={{ animationDelay: delay }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className,
      )}
      aria-busy="true"
      aria-label="Chargement des médias"
    >
      {Array.from({ length: count }).map((_, i) => (
        <MediaTileSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
