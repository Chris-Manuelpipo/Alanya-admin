export { GroupGridSkeleton, MeetingListSkeleton } from "./primitives/grid-card-skeleton";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InfoCardSkeleton,
  MemberListSkeleton,
  ProfileCardSkeleton,
} from "./primitives/profile-card-skeleton";

export function GroupDetailPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement du groupe">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-56 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ProfileCardSkeleton squareAvatar />
          <InfoCardSkeleton rows={4} />
        </div>
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32 rounded" />
            </CardHeader>
            <CardContent>
              <MemberListSkeleton count={6} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
