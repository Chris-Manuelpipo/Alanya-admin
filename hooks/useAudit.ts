import { useQuery } from '@tanstack/react-query';
import { fetchAudit, fetchAuditActions, type AuditQuery } from '@/lib/mock-data';

/**
 * Journal des actions administrateur.
 *
 * Une seule requête sert la page « Activité admin » et l'encart d'une fiche
 * utilisateur : la clé de cache porte les filtres, les deux vues ne se marchent
 * donc pas dessus.
 */
export function useAudit(query: AuditQuery = {}) {
  return useQuery({
    queryKey: ['admin-audit', query],
    queryFn: () => fetchAudit(query),
    // Le journal se consulte, il ne se surveille pas : pas de rafraîchissement
    // automatique, le bouton de la page suffit.
    staleTime: 30_000,
  });
}

export function useAuditActions() {
  return useQuery({
    queryKey: ['admin-audit-actions'],
    queryFn: fetchAuditActions,
    staleTime: 60_000,
  });
}
