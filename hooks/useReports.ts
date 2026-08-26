import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReportActions, fetchReports, postReportAction } from '@/lib/mock-data';

/**
 * File de modération.
 *
 * Rafraîchie plus souvent que le reste du panneau : c'est le seul écran où
 * l'inaction a un coût pour quelqu'un d'autre.
 */
export function useReports(state?: string) {
  return useQuery({
    queryKey: ['admin-reports', state ?? 'tous'],
    queryFn: () => fetchReports(state),
    refetchInterval: 60_000,
  });
}

export function useReportActions(id: number | null) {
  return useQuery({
    queryKey: ['admin-report-actions', id],
    queryFn: () => fetchReportActions(id as number),
    enabled: id != null,
  });
}

export function useHandleReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: number; action: string; note?: string }) =>
      postReportAction(id, action, note),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-report-actions', id] });
      // Une décision de modération est aussi une action d'administration : elle
      // apparaît dans le journal, qui doit se rafraîchir avec.
      qc.invalidateQueries({ queryKey: ['admin-audit'] });
    },
  });
}
