import { useQuery } from '@tanstack/react-query';
import { fetchMediaItems } from '@/lib/mock-data';

export function useMediaItems() {
  return useQuery({
    queryKey: ['admin-media'],
    queryFn: fetchMediaItems,
  });
}
