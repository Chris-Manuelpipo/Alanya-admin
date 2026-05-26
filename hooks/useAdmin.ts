import { useQuery } from '@tanstack/react-query';
import { fetchStats, fetchActivityFeed } from '@/lib/mock-data';

export function useStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin-stats', from, to],
    queryFn: () => fetchStats(from, to),
    refetchInterval: 30_000,
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ['admin-activity'],
    queryFn: fetchActivityFeed,
    refetchInterval: 15_000,
  });
}
