import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./stagger";
import { TEXT_WIDTHS } from "./variable-widths";

export function GroupCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const titleW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];
  const metaW = TEXT_WIDTHS[(index + 2) % TEXT_WIDTHS.length];

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="h-12 w-12 rounded-2xl shrink-0" style={{ animationDelay: delay }} />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className={cn("h-5 rounded", titleW)} style={{ animationDelay: delay }} />
            <Skeleton className={cn("h-3 rounded", metaW)} style={{ animationDelay: delay }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-14 rounded-full" style={{ animationDelay: delay }} />
          <Skeleton className="h-4 w-20 rounded" style={{ animationDelay: delay }} />
        </div>
      </CardContent>
    </Card>
  );
}

export function GroupGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}
      aria-busy="true"
      aria-label="Chargement des groupes"
    >
      {Array.from({ length: count }).map((_, i) => (
        <GroupCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

export function MeetingCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const titleW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" style={{ animationDelay: delay }} />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className={cn("h-5 rounded", titleW)} style={{ animationDelay: delay }} />
            <Skeleton className="h-3 w-32 rounded" style={{ animationDelay: delay }} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" style={{ animationDelay: delay }} />
              <Skeleton className="h-5 w-14 rounded-full" style={{ animationDelay: delay }} />
              <Skeleton className="h-4 w-24 rounded" style={{ animationDelay: delay }} />
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" style={{ animationDelay: delay }} />
            <Skeleton className="h-8 w-8 rounded-md" style={{ animationDelay: delay }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MeetingListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Chargement des réunions">
      {Array.from({ length: count }).map((_, i) => (
        <MeetingCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
