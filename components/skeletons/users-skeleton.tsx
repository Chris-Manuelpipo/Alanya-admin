import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ActionsCardSkeleton,
  ActivityStatGridSkeleton,
  InfoCardSkeleton,
  LoginHistorySkeleton,
  ProfileCardSkeleton,
} from "./primitives/profile-card-skeleton";
import { UsersTableRowsSkeleton, UsersTableSectionSkeleton } from "./primitives/table-skeleton";

export function UserDetailPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement du profil utilisateur">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-56 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ProfileCardSkeleton />
          <InfoCardSkeleton rows={6} />
          <ActionsCardSkeleton buttons={4} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20 rounded" />
            </CardHeader>
            <CardContent>
              <ActivityStatGridSkeleton count={5} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-44 rounded" />
            </CardHeader>
            <CardContent>
              <LoginHistorySkeleton count={4} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export {
  UsersTableRowsSkeleton,
  UsersTableSectionSkeleton,
};
