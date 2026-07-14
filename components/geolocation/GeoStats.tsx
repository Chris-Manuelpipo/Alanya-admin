"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, BarChart3 } from "lucide-react";
import { getFlag } from "@/lib/geo-utils";
import type { GeoDataResult } from "@/hooks/useGeoData";

interface GeoStatsProps {
  data: GeoDataResult;
}

export function GeoStats({ data }: GeoStatsProps) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            Vue globale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Total utilisateurs</span>
            <span className="text-sm font-bold">{data.totalCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Pays actifs</span>
            <span className="text-sm font-bold">{data.countries.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            Top pays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.countries.slice(0, 10).map((country, i) => (
            <div key={country.name} className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400 w-4 text-right">{i + 1}</span>
              <span className="text-base">{getFlag(country.name)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium truncate">{country.name}</span>
                  <span className="text-xs text-zinc-500 tabular-nums">{country.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-500" />
            Par région
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.regions.map((region) => (
            <div key={region.region}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium">{region.region}</span>
                <span className="text-xs text-zinc-500">
                  {region.total.toLocaleString()} ({region.percentage}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
