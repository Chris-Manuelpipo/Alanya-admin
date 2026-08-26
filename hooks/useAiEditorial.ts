"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { fetchAiStatus, reviewContent, translateContent } from "@/lib/mock-data";
import { usePermissions } from "@/hooks/usePermissions";
import type { AiReviewResult, AiTranslateResult } from "@/types";

/**
 * Disponibilité de l'assistance éditoriale.
 *
 * Deux conditions, et il faut les deux : la permission dit ce que
 * l'administrateur a le droit de faire, `GET /admin/ai/status` dit ce que le
 * serveur peut faire. Sans clé OpenRouter configurée, un super-admin voit
 * l'interface exactement comme avant — mieux vaut aucun bouton qu'un bouton
 * qui répond 503.
 *
 * La requête ne part pas sans la permission : elle recevrait un 403 qui
 * n'apprendrait rien. `staleTime` long parce que la réponse ne change qu'au
 * redémarrage du serveur.
 */
export function useAiEditorialAvailable(): boolean {
  const { can } = usePermissions();
  const allowed = can("ai.editorial");

  const { data } = useQuery({
    queryKey: ["admin-ai-status"],
    queryFn: fetchAiStatus,
    enabled: allowed,
    staleTime: 5 * 60 * 1000,
    // Un échec ici n'est pas une panne à réessayer : il signifie « pas
    // d'assistance », et l'éditeur fonctionne sans.
    retry: false,
  });

  return allowed && (data?.enabled ?? false);
}

/** Traduction d'un contenu officiel vers les langues manquantes. */
export function useTranslateContent() {
  return useMutation<AiTranslateResult, Error, Parameters<typeof translateContent>[0]>({
    mutationFn: translateContent,
  });
}

/** Relecture des versions déjà saisies. */
export function useReviewContent() {
  return useMutation<AiReviewResult, Error, Parameters<typeof reviewContent>[0]>({
    mutationFn: reviewContent,
  });
}
