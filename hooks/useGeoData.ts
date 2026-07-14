import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '@/lib/mock-data';
import { getCountryGeo, computeRegionStats } from '@/lib/geo-utils';

export interface GeoCountryData {
  name: string;
  count: number;
  lat: number;
  lng: number;
  percentage: number;
}

export interface GeoDataResult {
  countries: GeoCountryData[];
  totalCount: number;
  maxCount: number;
  countryRecord: Record<string, number>;
  regions: ReturnType<typeof computeRegionStats>;
}

export function useGeoData(from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin-geo-data', from, to],
    queryFn: async (): Promise<GeoDataResult> => {
      const stats = await fetchStats(from, to);
      const countryRecord: Record<string, number> = {};
      for (const c of stats.topCountries) {
        countryRecord[c.pays] = c.users;
      }
      const totalCount = stats.totalUsers;
      const maxCount = Math.max(...Object.values(countryRecord), 1);

      const countries: GeoCountryData[] = Object.entries(countryRecord)
        .map(([name, count]) => {
          const geo = getCountryGeo(name);
          return {
            name,
            count,
            lat: geo?.lat ?? 0,
            lng: geo?.lng ?? 0,
            percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
          };
        })
        .filter(c => c.lat !== 0 || c.lng !== 0)
        .sort((a, b) => b.count - a.count);

      const regions = computeRegionStats(countryRecord);

      return { countries, totalCount, maxCount, countryRecord, regions };
    },
    refetchInterval: 30_000,
  });
}
