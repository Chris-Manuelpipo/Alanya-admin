import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBroadcasts, createBroadcast } from '@/lib/mock-data';
import type { BroadcastFormData } from '@/types';

interface BroadcastsParams {
  page?: number;
  limit?: number;
}

export function useBroadcasts(params: BroadcastsParams = {}) {
  return useQuery({
    queryKey: ['admin-broadcasts', params],
    queryFn: () => fetchBroadcasts(params),
  });
}

export function useCreateBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BroadcastFormData) => createBroadcast(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-broadcasts'] }),
  });
}
