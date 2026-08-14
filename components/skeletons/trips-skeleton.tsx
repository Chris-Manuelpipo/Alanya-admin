import { AreaChartSkeleton, PieChartSkeleton } from "./primitives/chart-skeletons";
import { StatCardGridSkeleton } from "./primitives/stat-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

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
