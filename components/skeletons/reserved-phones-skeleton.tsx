import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./primitives/stagger";

const ROW_WIDTHS = [
  { phone: "w-[7.25rem]", label: "w-[42%]", meta: "w-[58%]" },
  { phone: "w-[6.5rem]", label: "w-[36%]", meta: "w-[48%]" },
  { phone: "w-[8rem]", label: "w-[44%]", meta: "w-[52%]" },
  { phone: "w-[7rem]", label: "w-[38%]", meta: "w-[46%]" },
  { phone: "w-[7.5rem]", label: "w-[40%]", meta: "w-[50%]" },
  { phone: "w-[6.75rem]", label: "w-[34%]", meta: "w-[44%]" },
] as const;

function ShimmerRow({
  compact,
  index,
}: {
  compact: boolean;
  index: number;
}) {
  const widths = ROW_WIDTHS[index % ROW_WIDTHS.length];
  const delay = stagger(index);

  if (compact) {
    return (
      <li
        className="flex items-center gap-3 px-3 py-2.5"
        style={{ animationDelay: delay }}
      >
        <Skeleton className={cn("h-4 rounded", widths.phone)} style={{ animationDelay: delay }} />
        <Skeleton className="h-3 flex-1 max-w-[9rem] rounded" style={{ animationDelay: delay }} />
      </li>
    );
  }

  return (
    <li
      className="flex items-center justify-between gap-4 py-3.5"
      style={{ animationDelay: delay }}
    >
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className={cn("h-5 rounded", widths.phone)} style={{ animationDelay: delay }} />
          <Skeleton className="h-5 w-14 rounded-full" style={{ animationDelay: delay }} />
        </div>
        <Skeleton className={cn("h-3.5 rounded", widths.label)} style={{ animationDelay: delay }} />
        <Skeleton className={cn("h-3.5 rounded", widths.meta)} style={{ animationDelay: delay }} />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Skeleton className="h-8 w-[5.5rem] rounded-md" style={{ animationDelay: delay }} />
        <Skeleton className="h-8 w-8 rounded-md" style={{ animationDelay: delay }} />
      </div>
    </li>
  );
}

/** Lignes skeleton pour la liste des numéros réservés. */
export function ReservedPhoneListSkeleton({
  count = 6,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        compact ? "overflow-hidden rounded-lg border bg-card/40" : "divide-y divide-border/70",
      )}
      aria-busy="true"
      aria-label="Chargement des numéros réservés"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerRow key={i} compact={compact} index={i} />
      ))}
    </ul>
  );
}

/** Section liste complète : filtres + lignes + pagination. */
export function ReservedPhonesListSectionSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement de la liste">
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-36 rounded-lg" />
      </div>

      <ReservedPhoneListSkeleton count={count} />

      <div className="flex items-center justify-between border-t border-border/70 pt-3">
        <Skeleton className="h-4 w-52 max-w-[55%] rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton compact pour la recherche dans le formulaire de création utilisateur. */
export function ReservedPhoneSearchSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Recherche en cours">
      <Skeleton className="h-10 w-full rounded-lg" />
      <ReservedPhoneListSkeleton count={count} compact />
    </div>
  );
}
