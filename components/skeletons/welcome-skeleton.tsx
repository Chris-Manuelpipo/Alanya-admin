import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stagger } from "./primitives/stagger";
import { cn } from "@/lib/utils";
import { TEXT_WIDTHS } from "./primitives/variable-widths";

/** Silhouette d'un bloc de l'éditeur : en-tête + zone de saisie. */
function WelcomeBlockSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  const labelW = TEXT_WIDTHS[index % TEXT_WIDTHS.length];

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <Skeleton className="h-6 w-6 shrink-0 rounded-md" style={{ animationDelay: delay }} />
        <Skeleton className="h-4 w-4 shrink-0 rounded" style={{ animationDelay: delay }} />
        <Skeleton className={cn("h-3 rounded", labelW)} style={{ animationDelay: delay }} />
        <div className="ml-auto flex gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" style={{ animationDelay: delay }} />
          <Skeleton className="h-8 w-8 rounded-lg" style={{ animationDelay: delay }} />
          <Skeleton className="h-8 w-8 rounded-lg" style={{ animationDelay: delay }} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-24 rounded" style={{ animationDelay: delay }} />
        <Skeleton className="h-[92px] w-full rounded-lg" style={{ animationDelay: delay }} />
      </div>
    </div>
  );
}

/**
 * Silhouette du téléphone d'aperçu.
 *
 * Elle occupe exactement la place du cadre réel : sans elle, la colonne se
 * remplirait d'un coup et pousserait la page au moment du chargement.
 */
function PreviewPanelSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-[72px] rounded-lg" style={{ animationDelay: delay }} />
        <Skeleton className="h-8 w-[84px] rounded-lg" style={{ animationDelay: delay }} />
        <Skeleton className="ml-auto h-9 w-[116px] rounded-lg" style={{ animationDelay: delay }} />
      </div>
      <div className="flex justify-center">
        <Skeleton
          className="h-[560px] w-[290px] rounded-[40px]"
          style={{ animationDelay: delay }}
        />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-3 w-56 rounded" style={{ animationDelay: delay }} />
      </div>
    </div>
  );
}

/** Carte « Version active » : titre, description, trois actions. */
function WelcomeVersionCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-48 rounded" style={{ animationDelay: stagger(0) }} />
        <Skeleton className="h-3 w-72 rounded" style={{ animationDelay: stagger(1) }} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-48 rounded-lg" style={{ animationDelay: stagger(1) }} />
          <Skeleton className="h-10 w-28 rounded-lg" style={{ animationDelay: stagger(2) }} />
          <Skeleton className="h-10 w-36 rounded-lg" style={{ animationDelay: stagger(3) }} />
        </div>
        <Skeleton className="h-3 w-[70%] rounded" style={{ animationDelay: stagger(3) }} />
      </CardContent>
    </Card>
  );
}

/** Barre d'onglets « Message » / « Statut 24 h ». */
function WelcomeTabsSkeleton() {
  return (
    <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      <div className="-mb-px flex items-center gap-2 border-b-2 border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <Skeleton className="h-4 w-4 rounded" style={{ animationDelay: stagger(0) }} />
        <Skeleton className="h-4 w-20 rounded" style={{ animationDelay: stagger(0) }} />
      </div>
      <div className="-mb-px flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5">
        <Skeleton className="h-4 w-4 rounded" style={{ animationDelay: stagger(1) }} />
        <Skeleton className="h-4 w-24 rounded" style={{ animationDelay: stagger(1) }} />
        <Skeleton className="h-4 w-12 rounded-full" style={{ animationDelay: stagger(1) }} />
      </div>
    </div>
  );
}

/** Carte « Éditeur » : boutons d'ajout, liste de blocs, colonne d'aperçu. */
function WelcomeEditorCardSkeleton({ blocks = 3 }: { blocks?: number }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <Skeleton className="h-5 w-24 rounded" style={{ animationDelay: stagger(0) }} />
        <Skeleton className="h-3 w-96 max-w-full rounded" style={{ animationDelay: stagger(1) }} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-3 w-14 rounded" style={{ animationDelay: stagger(1) }} />
              {[0, 1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-24 rounded-lg"
                  style={{ animationDelay: stagger(2 + i) }}
                />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: blocks }).map((_, i) => (
                <WelcomeBlockSkeleton key={i} index={i + 2} />
              ))}
            </div>
          </div>
          <PreviewPanelSkeleton index={2} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Silhouette de la page « Accueil des nouveaux inscrits ».
 *
 * Ne dessine que l'onglet Message, celui qui s'ouvre par défaut : préfigurer un
 * onglet masqué ferait attendre du contenu qui n'apparaîtra pas.
 */
export function WelcomePageSkeleton({ blocks = 3 }: { blocks?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de l'accueil">
      <WelcomeTabsSkeleton />
      <div className="space-y-6 pt-2">
        <WelcomeVersionCardSkeleton />
        <WelcomeEditorCardSkeleton blocks={blocks} />
      </div>
    </div>
  );
}
