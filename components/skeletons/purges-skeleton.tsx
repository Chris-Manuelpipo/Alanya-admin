import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardGridSkeleton } from "./primitives/stat-card-skeleton";
import { stagger } from "./primitives/stagger";

/**
 * Une carte de purge en chargement.
 *
 * La silhouette suit exactement celle de la vraie carte — en-tête avec titre
 * et badge, encart de volumétrie, réglages, historique, barre d'actions —
 * pour qu'aucun bloc ne se déplace à l'arrivée des données.
 */
export function PurgeCardSkeleton({ index = 0, knobs = 1 }: { index?: number; knobs?: number }) {
  const delay = stagger(index);

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" style={{ animationDelay: delay }} />
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40 rounded" style={{ animationDelay: delay }} />
                <Skeleton className="h-5 w-16 rounded-full" style={{ animationDelay: delay }} />
              </div>
              <Skeleton className="h-3 w-72 max-w-full rounded" style={{ animationDelay: delay }} />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-md shrink-0" style={{ animationDelay: delay }} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Encart de volumétrie */}
        <div className="rounded-lg border p-3 space-y-2">
          <Skeleton className="h-4 w-52 rounded" style={{ animationDelay: stagger(index + 1) }} />
          <Skeleton className="h-3 w-40 rounded" style={{ animationDelay: stagger(index + 1) }} />
        </div>

        {/* Réglages */}
        {Array.from({ length: knobs }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-48 rounded" style={{ animationDelay: stagger(index + i + 2) }} />
            <Skeleton className="h-8 w-24 rounded-md" style={{ animationDelay: stagger(index + i + 2) }} />
          </div>
        ))}

        {/* Historique */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3 w-36 rounded" style={{ animationDelay: stagger(index + 3) }} />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3 w-full max-w-md rounded"
              style={{ animationDelay: stagger(index + i + 4) }}
            />
          ))}
        </div>

        {/* Barre d'actions */}
        <div className="border-t pt-3">
          <Skeleton className="h-9 w-40 rounded-md" style={{ animationDelay: stagger(index + 5) }} />
        </div>
      </CardContent>
    </Card>
  );
}

/** Contenu complet de la page Purges en chargement : bandeau + une carte par purge. */
export function PurgesContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement des purges">
      <StatCardGridSkeleton count={3} ariaLabel="Chargement du récapitulatif des purges" />
      <div className="grid gap-4">
        {/* Le nombre de réglages varie d'une purge à l'autre : reproduire cette
            variation évite que les cartes ne se réajustent à l'arrivée. */}
        {[1, 0, 1, 1, 3, 0].map((knobs, i) => (
          <PurgeCardSkeleton key={i} index={i} knobs={knobs} />
        ))}
      </div>
    </div>
  );
}
