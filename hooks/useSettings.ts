import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/lib/mock-data';
import { AppSettings } from '@/types';

export function useSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AppSettings>) => updateSettings(patch),
    onSuccess: (data) => qc.setQueryData(['admin-settings'], data),
  });
}
