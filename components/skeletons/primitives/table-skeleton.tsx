import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./stagger";
import { SHORT_WIDTHS, TEXT_WIDTHS } from "./variable-widths";
import { PaginationSkeleton } from "./pagination-skeleton";

const ROW_PROFILES = [
  { id: "w-10", name: "w-28", sub: "w-20", email: "w-36", phone: "w-24", role: "w-16", status: "w-14", date: "w-20" },
  { id: "w-8", name: "w-32", sub: "w-16", email: "w-40", phone: "w-20", role: "w-14", status: "w-16", date: "w-18" },
  { id: "w-12", name: "w-24", sub: "w-22", email: "w-32", phone: "w-28", role: "w-18", status: "w-12", date: "w-22" },
  { id: "w-9", name: "w-30", sub: "w-18", email: "w-38", phone: "w-22", role: "w-16", status: "w-14", date: "w-20" },
  { id: "w-11", name: "w-26", sub: "w-20", email: "w-34", phone: "w-26", role: "w-14", status: "w-16", date: "w-18" },
  { id: "w-10", name: "w-28", sub: "w-16", email: "w-36", phone: "w-24", role: "w-16", status: "w-14", date: "w-20" },
] as const;

function UserTableRowSkeleton({ index }: { index: number }) {
  const delay = stagger(index);
  const w = ROW_PROFILES[index % ROW_PROFILES.length];

  return (
    <tr style={{ animationDelay: delay }}>
      <td className="px-2 py-3">
        <Skeleton className="h-5 w-5 rounded" style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-4 rounded font-mono", w.id)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-4 rounded mb-1", w.name)} style={{ animationDelay: delay }} />
        <Skeleton className={cn("h-3 rounded", w.sub)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-9 w-9 rounded-full" style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-4 rounded", w.email)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-4 rounded font-mono", w.phone)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-5 rounded-full", w.role)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-5 rounded-full", w.status)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3">
        <Skeleton className={cn("h-3 rounded", w.date)} style={{ animationDelay: delay }} />
      </td>
      <td className="px-3 py-3 text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" style={{ animationDelay: delay }} />
      </td>
    </tr>
  );
}

export function UsersTableRowsSkeleton({
  count = 8,
  ariaLabel = "Chargement des utilisateurs",
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <UserTableRowSkeleton key={i} index={i} />
      ))}
    </>
  );
}

export function UsersTableSectionSkeleton({
  count = 8,
  showPagination = true,
}: {
  count?: number;
  showPagination?: boolean;
}) {
  return (
    <div aria-busy="true" aria-label="Chargement du tableau">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
              {[...Array(10)].map((_, i) => (
                <th key={i} className="px-3 py-3">
                  <Skeleton className="h-3 w-12 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            <UsersTableRowsSkeleton count={count} />
          </tbody>
        </table>
      </div>
      {showPagination && (
        <div className="mt-4">
          <PaginationSkeleton />
        </div>
      )}
    </div>
  );
}

export function RankedListSkeleton({
  count = 5,
  ariaLabel = "Chargement du classement",
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <div className="divide-y dark:divide-zinc-800" aria-busy="true" aria-label={ariaLabel}>
      {Array.from({ length: count }).map((_, i) => {
        const delay = stagger(i);
        const nameW = SHORT_WIDTHS[i % SHORT_WIDTHS.length];
        const statW = TEXT_WIDTHS[(i + 1) % TEXT_WIDTHS.length];
        return (
          <div key={i} className="flex items-center gap-3 py-3" style={{ animationDelay: delay }}>
            <Skeleton className="h-4 w-6 rounded" style={{ animationDelay: delay }} />
            <Skeleton className="h-9 w-9 rounded-full shrink-0" style={{ animationDelay: delay }} />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className={cn("h-4 rounded", nameW)} style={{ animationDelay: delay }} />
              <Skeleton className="h-3 w-16 rounded" style={{ animationDelay: delay }} />
            </div>
            <div className="flex gap-3">
              <Skeleton className={cn("h-3 rounded", statW)} style={{ animationDelay: delay }} />
              <Skeleton className="h-3 w-10 rounded" style={{ animationDelay: delay }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TopCountriesSkeleton({
  count = 7,
  ariaLabel = "Chargement des pays",
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={ariaLabel}>
      {Array.from({ length: count }).map((_, i) => {
        const delay = stagger(i);
        const barW = TEXT_WIDTHS[i % TEXT_WIDTHS.length];
        return (
          <div key={i} className="flex items-center gap-3" style={{ animationDelay: delay }}>
            <Skeleton className="h-7 w-7 rounded shrink-0" style={{ animationDelay: delay }} />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" style={{ animationDelay: delay }} />
                <Skeleton className="h-4 w-10 rounded" style={{ animationDelay: delay }} />
              </div>
              <Skeleton className={cn("h-2 rounded-full", barW)} style={{ animationDelay: delay }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
