"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { GeoStats } from "@/components/geolocation/GeoStats";
import { GeoFilterBar } from "@/components/geolocation/GeoFilterBar";
import { useGeoData } from "@/hooks/useGeoData";
import { GeolocationPageSkeleton } from "@/components/skeletons";
import { periodToRange } from "@/lib/period";
import { MapPin } from "lucide-react";

const WorldMap = dynamic(() => import("@/components/geolocation/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Chargement de la carte...</span>
      </div>
    </div>
  ),
});

export default function GeolocationPage() {
  const defaultRange = periodToRange("30d");
  const [period, setPeriod] = useState("30d");
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);

  function handlePeriodChange(value: string) {
    setPeriod(value);
    const { from, to } = periodToRange(value);
    setDateFrom(from);
    setDateTo(to);
  }

  function handleDateFromChange(value: string) {
    setPeriod("");
    setDateFrom(value);
  }

  function handleDateToChange(value: string) {
    setPeriod("");
    setDateTo(value);
  }

  const { data: geoData, isLoading, isFetching, isError, refetch } = useGeoData(dateFrom, dateTo);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-500" />
            Géolocalisation
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Répartition géographique des utilisateurs Alanya
          </p>
        </div>
        <GeoFilterBar
          period={period}
          onPeriodChange={handlePeriodChange}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />
      </div>

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement des données</p>
          <button onClick={() => refetch()} className="text-sm text-indigo-600 hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {(isLoading || isFetching) && <GeolocationPageSkeleton />}

      {!isError && !isLoading && geoData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[600px]">
            <WorldMap
              countries={geoData.countries}
              maxCount={geoData.maxCount}
              countryRecord={geoData.countryRecord}
            />
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <GeoStats data={geoData} />
          </div>
        </div>
      )}

      {!isError && !isLoading && geoData && (
        <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-sm">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
            <strong className="text-indigo-700 dark:text-indigo-300">{geoData.countries.length}</strong> pays actifs
          </span>
          <span className="flex items-center gap-2">
            <span className="text-indigo-600">🌍</span>
            <strong className="text-indigo-700 dark:text-indigo-300">{geoData.totalCount.toLocaleString()}</strong> utilisateurs
          </span>
          {geoData.countries.length > 0 && (
            <span className="flex items-center gap-2">
              <span className="text-indigo-600">🏆</span>
              <span className="text-indigo-700 dark:text-indigo-300">
                Top: <strong>{geoData.countries[0].name}</strong> ({geoData.countries[0].count.toLocaleString()})
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
