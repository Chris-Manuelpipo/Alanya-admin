"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { Megaphone, Image, Video, FileText, Users, Calendar, Radio } from "lucide-react";

const typeIcons: Record<number, React.ElementType> = {
  0: FileText,
  1: Image,
  2: Video,
  3: Radio,
};

const typeLabels: Record<number, string> = {
  0: "Texte",
  1: "Image",
  2: "Vidéo",
  3: "Statut",
};

const targetLabels: Record<string, string> = {
  all: "Tous",
  country: "Par pays",
  specific: "Spécifiques",
};

export function BroadcastHistory() {
  const { data, isLoading } = useBroadcasts();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-8 text-center">
          <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const broadcasts = data?.items || [];

  if (broadcasts.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-12 text-center">
          <Megaphone className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucun broadcast envoyé</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Historique ({data?.total || broadcasts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {broadcasts.map((b) => {
            const TypeIcon = typeIcons[b.type] || FileText;
            return (
              <div
                key={b.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50 shrink-0">
                  <TypeIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">{b.content}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className={`text-[10px] ${b.type === 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : ""}`}>
                      {typeLabels[b.type]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {targetLabels[b.targetType]}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <Users className="h-3 w-3" />
                      {b.recipientCount}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(b.sentAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
