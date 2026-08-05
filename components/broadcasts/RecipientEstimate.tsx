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
}

export function RecipientEstimate({ count, loading }: RecipientEstimateProps) {
  return (
    <div className="rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
        Destinataires estimés
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Calcul…
        </div>
      ) : (
        <p className="text-2xl font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
          {count != null ? count.toLocaleString("fr-FR") : "—"}
        </p>
      )}
    </div>
  );
}
