"use client";

import { useBroadcast } from "@/hooks/useBroadcasts";
import type { BroadcastPushStatus } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  preparing: "Préparation…",
  queued: "En file",
  running: "Envoi en cours",
  completed: "Terminé",
  partial_failed: "Terminé (erreurs)",
};

export function isActiveBroadcastStatus(status: string): boolean {
  return status === "preparing" || status === "queued" || status === "running";
}

interface BroadcastProgressProps {
  broadcastId: number;
  compact?: boolean;
}

export function BroadcastProgress({ broadcastId, compact }: BroadcastProgressProps) {
  const { data } = useBroadcast(broadcastId, true);
  if (!data) return null;

  const pct = data.pushProgress ?? 0;
  const status = data.status as BroadcastPushStatus;

  if (compact) {
    return (
      <div className="w-full max-w-[200px] space-y-1">
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>{STATUS_LABELS[status] || status}</span>
          <span className="font-mono tabular-nums">{pct} %</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{STATUS_LABELS[status] || status}</span>
        <span className="font-mono tabular-nums text-zinc-500">{pct} %</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <p className="text-xs text-zinc-400 font-mono">
        {data.pushJobsDone + data.pushFailedJobs} / {data.pushJobsTotal} lots
      </p>
    </div>
  );
}
