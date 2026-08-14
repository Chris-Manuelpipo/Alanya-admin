import { useQuery } from "@tanstack/react-query";
import { fetchTripStats } from "@/lib/mock-data";

export function useTripStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ["admin-trips", from, to],
    queryFn: () => fetchTripStats(from, to),
    refetchInterval: 60_000,
  });
}
