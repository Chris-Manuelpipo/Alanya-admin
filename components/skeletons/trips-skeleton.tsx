import { AreaChartSkeleton, PieChartSkeleton } from "./primitives/chart-skeletons";
import { StatCardGridSkeleton } from "./primitives/stat-card-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./primitives/stagger";
import { TEXT_WIDTHS } from "./primitives/variable-widths";

/** Contenu page trajets (KPIs + charts). Header géré par la page. */
export function TripsContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement des trajets">
      <StatCardGridSkeleton count={6} className="sm:grid-cols-2 lg:grid-cols-3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaChartSkeleton ariaLabel="Chargement trajets par jour" />
        </div>
        <PieChartSkeleton ariaLabel="Chargement répartition par type" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartSkeleton ariaLabel="Chargement issues" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

/** Une ligne « libellé … valeur », comme la carte Politique en vigueur. */
function KeyValueRowSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const labelW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];

  return (
    <div className="flex items-baseline justify-between gap-4">
      <Skeleton className={cn("h-4 rounded", labelW)} style={{ animationDelay: delay }} />
      <Skeleton className="h-4 w-20 rounded shrink-0" style={{ animationDelay: delay }} />
    </div>
  );
}

/** Une purge du journal : portée + date à gauche, volumes à droite. */
function PurgeRunSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-28 rounded-full" style={{ animationDelay: delay }} />
          <Skeleton className="h-4 w-32 rounded" style={{ animationDelay: delay }} />
        </div>
        <Skeleton className="h-3 w-40 rounded" style={{ animationDelay: delay }} />
      </div>
      <div className="space-y-1.5 shrink-0 flex flex-col items-end">
        <Skeleton className="h-4 w-24 rounded" style={{ animationDelay: delay }} />
        <Skeleton className="h-3 w-20 rounded" style={{ animationDelay: delay }} />
      </div>
    </div>
  );
}

/**
 * Contenu page rétention des traces. Header géré par la page.
 *
 * Le gabarit suit la vraie page (4 compteurs, deux cartes côte à côte, journal
 * + encart) pour que rien ne saute au moment où les données arrivent.
 */
export function TripRetentionContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de la rétention">
      <StatCardGridSkeleton count={4} ariaLabel="Chargement des volumes de traces" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-44 rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <KeyValueRowSkeleton key={i} index={i} />
            ))}
            <div className="pt-2 border-t space-y-1.5">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-36 rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={cn("space-y-2", i > 0 && "pt-3 border-t")}>
                <Skeleton className="h-4 w-56 rounded" style={{ animationDelay: stagger(i) }} />
                <Skeleton className="h-3 w-full rounded" style={{ animationDelay: stagger(i) }} />
                <Skeleton className="h-3 w-3/4 rounded" style={{ animationDelay: stagger(i) }} />
                <Skeleton className="h-9 w-44 rounded-lg" style={{ animationDelay: stagger(i) }} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900 lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-36 rounded" />
          </CardHeader>
          <CardContent className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <PurgeRunSkeleton key={i} index={i} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-48 rounded" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            {TEXT_WIDTHS.slice(0, 4).map((w, i) => (
              <Skeleton
                key={w}
                className={cn("h-4 rounded", i % 2 === 0 ? "w-full" : "w-5/6")}
                style={{ animationDelay: stagger(i) }}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
