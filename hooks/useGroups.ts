import { useQuery } from '@tanstack/react-query';
import { fetchGroups } from '@/lib/mock-data';

export function useGroups() {
  return useQuery({
    queryKey: ['admin-groups'],
    queryFn: fetchGroups,
  });
}
