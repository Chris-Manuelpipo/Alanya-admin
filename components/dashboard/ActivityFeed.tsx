"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, MessageSquare, Phone, Video, Smile } from "lucide-react";
import { ActivityEntry } from "@/types";

interface ActivityFeedProps {
  data?: ActivityEntry[];
  isLoading: boolean;
}

const iconMap = {
  user_joined: UserPlus,
  message: MessageSquare,
  call: Phone,
  meeting: Video,
  status: Smile,
};

const colorMap = {
  user_joined: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
  message: "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
  call: "text-violet-500 bg-violet-50 dark:bg-violet-950/50",
  meeting: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
  status: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
};

export function ActivityFeed({ data, isLoading }: ActivityFeedProps) {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {data?.map((entry) => {
              const Icon = iconMap[entry.type];
              const colorClass = colorMap[entry.type];
              return (
                <div key={entry.id} className="flex items-center gap-3 py-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{entry.user}</span>{" "}
                      <span className="text-zinc-500">{entry.detail}</span>
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400 shrink-0">{entry.time}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
