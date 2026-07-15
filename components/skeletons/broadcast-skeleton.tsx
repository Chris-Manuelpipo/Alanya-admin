import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stagger } from "./primitives/stagger";
import { cn } from "@/lib/utils";
import { TEXT_WIDTHS } from "./primitives/variable-widths";

function BroadcastItemSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const contentW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
      <Skeleton
        className="h-9 w-9 rounded-lg shrink-0"
        style={{ animationDelay: delay }}
      />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton
          className={cn("h-4 rounded", contentW)}
          style={{ animationDelay: delay }}
        />
        <Skeleton
          className="h-3 w-[60%] rounded"
          style={{ animationDelay: delay }}
        />
        <div className="flex items-center gap-3 pt-0.5">
          <Skeleton className="h-4 w-14 rounded-full" style={{ animationDelay: delay }} />
          <Skeleton className="h-4 w-16 rounded-full" style={{ animationDelay: delay }} />
          <Skeleton className="h-3 w-12 rounded" style={{ animationDelay: delay }} />
          <Skeleton className="h-3 w-20 rounded" style={{ animationDelay: delay }} />
        </div>
      </div>
    </div>
  );
}

export function BroadcastHistorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900" aria-busy="true" aria-label="Chargement des broadcasts">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32 rounded" style={{ animationDelay: stagger(0) }} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <BroadcastItemSkeleton key={i} index={i + 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
