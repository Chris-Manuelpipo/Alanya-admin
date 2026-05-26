import { useQuery } from '@tanstack/react-query';
import { fetchMeetings } from '@/lib/mock-data';

export function useMeetings() {
  return useQuery({
    queryKey: ['admin-meetings'],
    queryFn: fetchMeetings,
  });
}
