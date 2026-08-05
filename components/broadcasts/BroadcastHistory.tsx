"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { BroadcastHistorySkeleton } from "@/components/skeletons";
import { BroadcastProgress, isActiveBroadcastStatus } from "./BroadcastProgress";
import { formatCriteriaSummary } from "@/lib/criteria-labels";
import { useCountries } from "@/hooks/useCountries";
import { Megaphone, FileText, Image, Video, Radio, Calendar, Clock } from "lucide-react";
import type { Broadcast } from "@/types";

const mediaTypeIcons: Record<number, React.ElementType> = {
  0: FileText,
  1: Image,
  2: Video,
};

function formatOpenRate(b: Broadcast): string {
  if (b.deliveredCountRefreshedAt && b.estimate > 0) {
    const rate = Math.round((b.deliveredCount / b.estimate) * 100);
    return `${rate} %`;
  }
  if (b.openRate > 0) {
    return `${Math.round(b.openRate * 100)} %`;
  }
  if (isActiveBroadcastStatus(b.status)) return "—";
  return b.deliveredCountRefreshedAt ? "0 %" : "…";
}

function BroadcastRow({ b, countryName }: { b: Broadcast; countryName: (id: number) => string | undefined }) {
  const isStatus = b.kind === 1;
  const TypeIcon = isStatus ? Radio : (mediaTypeIcons[b.type] || FileText);
  const criteriaLabel = formatCriteriaSummary(b.criteria, { countryName });
  const showProgress =
    b.pushJobsTotal > 0 ||
    isActiveBroadcastStatus(b.status) ||
    b.status === "completed" ||
    b.status === "partial_failed";

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
        isStatus ? "bg-amber-100 dark:bg-amber-950/50" : "bg-indigo-100 dark:bg-indigo-950/50"
      }`}>
        <TypeIcon className={`h-4 w-4 ${isStatus ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"}`} />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">{b.content}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={`text-[10px] ${isStatus ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : ""}`}>
              {isStatus ? "Statut" : b.type === 0 ? "Message" : b.type === 1 ? "Image" : "Vidéo"}
            </Badge>
            <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[28ch]" title={criteriaLabel}>
              {criteriaLabel}
            </span>
            {b.senderName && (
              <span className="text-[10px] text-zinc-400">via {b.senderName}</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(b.sentAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              {" "}
              {new Date(b.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="font-mono tabular-nums">
              {(b.estimate ?? 0).toLocaleString("fr-FR")} dest.
            </span>
            <span className="font-mono tabular-nums" title={b.deliveredCountRefreshedAt ? `Actualisé ${new Date(b.deliveredCountRefreshedAt).toLocaleString("fr-FR")}` : undefined}>
              {formatOpenRate(b)} ouvertures
            </span>
            {b.deliveredCountRefreshedAt && (
              <span className="flex items-center gap-1 text-zinc-300 dark:text-zinc-600">
                <Clock className="h-3 w-3" />
                {new Date(b.deliveredCountRefreshedAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
        {showProgress && (
          <BroadcastProgress broadcastId={b.id} compact />
        )}
      </div>
    </div>
  );
}

export function BroadcastHistory() {
  const { data, isLoading } = useBroadcasts();
  const { data: countries } = useCountries();

  const countryName = (id: number) => countries?.find((c) => c.idPays === id)?.libelle;

  if (isLoading) {
    return <BroadcastHistorySkeleton />;
  }

  const broadcasts = data?.items || [];
  const scheduled = data?.scheduled || [];

  if (broadcasts.length === 0 && scheduled.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-12 text-center">
          <Megaphone className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune diffusion envoyée</p>
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
      <CardContent className="space-y-4">
        {scheduled.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Programmées</p>
            {scheduled.map((s) => (
              <div key={s.jobId} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
                <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{String(s.payload?.content || "Diffusion programmée")}</p>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(s.scheduledAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {broadcasts.map((b) => (
            <BroadcastRow key={b.id} b={b} countryName={countryName} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
