import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPurges, runPurgeNow, updatePurge } from "@/lib/mock-data";
import type { PurgeSetting } from "@/types";

const KEY = ["admin-purges"];

export function usePurges() {
  return useQuery({ queryKey: KEY, queryFn: fetchPurges });
}

export function useUpdatePurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, ...payload }: {
      name: string;
      enabled?: boolean;
      overrides?: Record<string, number | null>;
    }) => updatePurge(name, payload),
    // La réponse ne porte que la purge modifiée : on la fusionne dans la liste
    // en cache plutôt que de tout recharger (les comptages balaient plusieurs
    // tables, un rechargement complet serait coûteux pour un simple toggle).
    onSuccess: (maj) => {
      qc.setQueryData<PurgeSetting[]>(KEY, (old) =>
        (old || []).map((p) => (p.name === maj.name ? { ...p, ...maj } : p)));
    },
  });
}

export function useRunPurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => runPurgeNow(name),
    // Après une purge réelle, les compteurs « à supprimer » ont changé :
    // seul un rechargement complet les remet d'aplomb.
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
