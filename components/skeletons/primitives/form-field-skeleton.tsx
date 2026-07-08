import { Skeleton } from "@/components/ui/skeleton";
import { stagger } from "./stagger";

export function FormFieldSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Chargement du champ">
      <Skeleton className="h-4 w-16 rounded" style={{ animationDelay: delay }} />
      <Skeleton className="h-10 w-full rounded-md" style={{ animationDelay: delay }} />
    </div>
  );
}

export function SelectFieldSkeleton({ index = 0 }: { index?: number }) {
  const delay = stagger(index);
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Chargement de la liste">
      <Skeleton className="h-4 w-12 rounded" style={{ animationDelay: delay }} />
      <Skeleton className="h-10 w-full rounded-md" style={{ animationDelay: delay }} />
    </div>
  );
}
