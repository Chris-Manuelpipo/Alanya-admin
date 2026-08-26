import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWelcomeConfig,
  saveWelcomeDraft,
  publishWelcomeConfig,
  backfillWelcomeMessages,
  fetchWelcomeStatus,
  saveWelcomeStatus,
} from '@/lib/mock-data';
import type { WelcomeBlock, WelcomeStatusConfig } from '@/types';

export function useWelcomeConfig() {
  return useQuery({
    queryKey: ['admin-welcome'],
    queryFn: fetchWelcomeConfig,
  });
}

export function useSaveWelcomeDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blocks: WelcomeBlock[]) => saveWelcomeDraft(blocks),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-welcome'] }),
  });
}

export function usePublishWelcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishWelcomeConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-welcome'] }),
  });
}

export function useBackfillWelcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: backfillWelcomeMessages,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-welcome'] }),
  });
}

/**
 * Statut de bienvenue. Clé de cache distincte de `admin-welcome` : le statut
 * n'est pas versionné et n'a rien à voir avec le cycle brouillon/publication.
 */
export function useWelcomeStatus() {
  return useQuery({
    queryKey: ['admin-welcome-status'],
    queryFn: fetchWelcomeStatus,
  });
}

export function useSaveWelcomeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: WelcomeStatusConfig) => saveWelcomeStatus(config),
    onSuccess: (data) => {
      qc.setQueryData(['admin-welcome-status'], data);
    },
  });
}
