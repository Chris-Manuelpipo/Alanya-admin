import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stagger } from "./stagger";
import { TEXT_WIDTHS } from "./variable-widths";

export function ProfileCardSkeleton({ squareAvatar = false }: { squareAvatar?: boolean }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 text-center">
        <Skeleton
          className={`h-24 w-24 mx-auto mb-4 ${squareAvatar ? "rounded-2xl" : "rounded-full"}`}
        />
        <Skeleton className="h-6 w-36 mx-auto rounded mb-2" />
        <Skeleton className="h-4 w-24 mx-auto rounded mb-4" />
        <div className="flex justify-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function InfoCardSkeleton({
  rows = 5,
  title = "Informations",
}: {
  rows?: number;
  title?: string;
}) {
  return (
    <Card className="border-0 shadow-sm" aria-busy="true" aria-label={`Chargement : ${title}`}>
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-28 rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => {
          const delay = stagger(i);
          const w = TEXT_WIDTHS[i % TEXT_WIDTHS.length];
          return (
            <div key={i} className="flex items-center gap-3" style={{ animationDelay: delay }}>
              <Skeleton className="h-4 w-4 rounded shrink-0" style={{ animationDelay: delay }} />
              <Skeleton className={`h-4 rounded flex-1 max-w-full ${w}`} style={{ animationDelay: delay }} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ActionsCardSkeleton({ buttons = 3 }: { buttons?: number }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-20 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: buttons }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" style={{ animationDelay: stagger(i) }} />
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivityStatGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      aria-busy="true"
      aria-label="Chargement de l'activité"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900"
          style={{ animationDelay: stagger(i) }}
        >
          <Skeleton className="h-5 w-5 rounded mb-2" style={{ animationDelay: stagger(i) }} />
          <Skeleton className="h-7 w-12 rounded mb-1" style={{ animationDelay: stagger(i) }} />
          <Skeleton className="h-3 w-16 rounded" style={{ animationDelay: stagger(i) }} />
        </div>
      ))}
    </div>
  );
}

export function LoginHistorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Chargement des connexions">
      {Array.from({ length: count }).map((_, i) => {
        const delay = stagger(i);
        const w = TEXT_WIDTHS[i % TEXT_WIDTHS.length];
        return (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
            style={{ animationDelay: delay }}
          >
            <Skeleton className="h-9 w-9 rounded-full shrink-0" style={{ animationDelay: delay }} />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className={`h-4 rounded ${w}`} style={{ animationDelay: delay }} />
              <Skeleton className="h-3 w-24 rounded" style={{ animationDelay: delay }} />
            </div>
            <div className="text-right space-y-1 shrink-0">
              <Skeleton className="h-3 w-16 rounded ml-auto" style={{ animationDelay: delay }} />
              <Skeleton className="h-3 w-10 rounded ml-auto" style={{ animationDelay: delay }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MemberListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Chargement des membres">
      {Array.from({ length: count }).map((_, i) => {
        const delay = stagger(i);
        const w = TEXT_WIDTHS[i % TEXT_WIDTHS.length];
        return (
          <div
            key={i}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
            style={{ animationDelay: delay }}
          >
            <Skeleton className="h-10 w-10 rounded-full shrink-0" style={{ animationDelay: delay }} />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className={`h-4 rounded ${w}`} style={{ animationDelay: delay }} />
              <Skeleton className="h-3 w-20 rounded" style={{ animationDelay: delay }} />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" style={{ animationDelay: delay }} />
          </div>
        );
      })}
    </div>
  );
}
