"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, ChevronRight } from "lucide-react";
import { TopUser } from "@/types";
import { useRouter } from "next/navigation";

interface TopUsersTableProps {
  data: TopUser[];
}

const rankBadges = ["🥇", "🥈", "🥉"];

export function TopUsersTable({ data }: TopUsersTableProps) {
  const router = useRouter();

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Utilisateurs les plus actifs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y dark:divide-zinc-800">
          {data.map((user, idx) => (
            <div
              key={user.alanyaID}
              onClick={() => router.push(`/users/${user.alanyaID}`)}
              className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
            >
              <span className="text-sm font-medium text-zinc-400 w-6 text-center">
                {idx < 3 ? (
                  <span className="text-base">{rankBadges[idx]}</span>
                ) : (
                  idx + 1
                )}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {user.nom.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.nom}</p>
                <p className="text-xs text-zinc-500 truncate">@{user.pseudo}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {user.messagesSent.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {user.callsMade + user.callsReceived}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
