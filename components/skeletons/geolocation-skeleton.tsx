import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stagger } from "./primitives/stagger";

function GeoStatsCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-32 rounded" style={{ animationDelay: delay }} />
      </CardHeader>
      <CardContent className="space-y-2.5">
        {Array.from({ length: index === 0 ? 2 : index === 1 ? 6 : 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {index >= 1 && <Skeleton className="h-4 w-4 rounded shrink-0" style={{ animationDelay: delay }} />}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24 rounded" style={{ animationDelay: delay }} />
                <Skeleton className="h-3 w-10 rounded" style={{ animationDelay: delay }} />
              </div>
              {index >= 1 && <Skeleton className="h-1.5 w-full rounded-full" style={{ animationDelay: delay }} />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function GeolocationPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de la géolocalisation">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded" style={{ animationDelay: stagger(0) }} />
          <Skeleton className="h-4 w-64 rounded" style={{ animationDelay: stagger(1) }} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" style={{ animationDelay: stagger(2) }} />
          <Skeleton className="h-10 w-10 rounded-lg" style={{ animationDelay: stagger(3) }} />
        </div>
      </div>

      {/* Map + Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton
            className="h-[600px] w-full rounded-xl"
            style={{ animationDelay: stagger(4) }}
          />
        </div>
        <div className="space-y-4 overflow-y-auto max-h-[600px]">
          <GeoStatsCardSkeleton index={5} />
          <GeoStatsCardSkeleton index={6} />
          <GeoStatsCardSkeleton index={7} />
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
        <Skeleton className="h-4 w-36 rounded" style={{ animationDelay: stagger(8) }} />
        <Skeleton className="h-4 w-32 rounded" style={{ animationDelay: stagger(9) }} />
        <Skeleton className="h-4 w-40 rounded" style={{ animationDelay: stagger(10) }} />
      </div>
    </div>
  );
}
