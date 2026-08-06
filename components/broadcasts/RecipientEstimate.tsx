"use client";

import { useEffect, useMemo, useState } from "react";
import { useEstimateBroadcast } from "@/hooks/useBroadcasts";
import type { BroadcastCriteria } from "@/types";
import { Loader2 } from "lucide-react";

export function useRecipientEstimate(criteria: BroadcastCriteria) {
  const estimate = useEstimateBroadcast();
  const [debounced, setDebounced] = useState(criteria);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(criteria), 300);
    return () => clearTimeout(t);
  }, [criteria]);

  const key = useMemo(() => JSON.stringify(debounced), [debounced]);

  useEffect(() => {
    let cancelled = false;
    estimate.mutate(debounced, {
      onSuccess: (data) => {
        if (!cancelled) setCount(data.count);
      },
      onError: () => {
        if (!cancelled) setCount(null);
      },
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { count, loading: estimate.isPending };
}

interface RecipientEstimateProps {
  count: number | null;
  loading: boolean;
  /** Résumé lisible des critères — `formatCriteriaSummary`. */
  summary?: string;
}

export function RecipientEstimate({ count, loading, summary }: RecipientEstimateProps) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
        Destinataires estimés
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Calcul…
        </div>
      ) : (
        <p className="font-mono text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {count != null ? count.toLocaleString("fr-FR") : "—"}
        </p>
      )}
      {summary ? (
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{summary}</p>
      ) : null}
    </div>
  );
}
