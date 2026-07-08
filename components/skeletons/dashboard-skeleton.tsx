import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChartSkeleton,
  BarChartSkeleton,
  PieChartSkeleton,
} from "./primitives/chart-skeletons";
import { FeedListSkeleton } from "./primitives/feed-item-skeleton";
import { StatCardGridSkeleton } from "./primitives/stat-card-skeleton";
import { RankedListSkeleton, TopCountriesSkeleton } from "./primitives/table-skeleton";

/** Zone données du dashboard (stats + graphiques + listes). */
export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement du dashboard">
      <StatCardGridSkeleton
        count={6}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        ariaLabel="Chargement des indicateurs"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaChartSkeleton ariaLabel="Chargement des inscriptions" />
        </div>
        <PieChartSkeleton ariaLabel="Chargement du statut utilisateurs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChartSkeleton ariaLabel="Chargement de l'activité" />
        </div>
        <PieChartSkeleton ariaLabel="Chargement du top pays" />
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24 rounded" />
        </CardHeader>
        <CardContent>
          <TopCountriesSkeleton count={7} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900 lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <RankedListSkeleton count={5} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32 rounded" />
          </CardHeader>
          <CardContent>
            <FeedListSkeleton count={5} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-40 rounded" />
      </div>
    </div>
  );
}

/** Premier chargement complet (header géré par la page). */
export function DashboardPageSkeleton() {
  return <DashboardContentSkeleton />;
}

/** Rafraîchissement : stats + charts uniquement. */
export function DashboardRefetchSkeleton() {
  return <DashboardContentSkeleton />;
}
