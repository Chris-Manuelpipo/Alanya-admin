import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '@/lib/mock-data';

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60,
  });
}
