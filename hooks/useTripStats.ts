import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTripRetention, fetchTripStats, runTripPurge } from "@/lib/mock-data";

export function useTripStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ["admin-trips", from, to],
    queryFn: () => fetchTripStats(from, to),
    refetchInterval: 60_000,
  });
}

export function useTripRetention() {
  return useQuery({
    queryKey: ["admin-trip-retention"],
    queryFn: fetchTripRetention,
  });
}

export function useRunTripPurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scope: "retention" | "all") => runTripPurge(scope),
    // La réponse porte déjà les compteurs recalculés après la purge : on la
    // pose dans le cache au lieu de refaire un aller-retour.
    onSuccess: (data) => qc.setQueryData(["admin-trip-retention"], data),
  });
}
