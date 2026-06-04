import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '@/lib/mock-data';

export function useAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin-analytics', from, to],
    queryFn: () => fetchAnalytics(from, to),
    refetchInterval: 60_000,
  });
}
