"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HeatmapCell {
  dow: number; // 0 = dimanche … 6 = samedi
  hour: number; // 0 … 23
  count: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  title: string;
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function HeatmapChart({ data, title }: HeatmapChartProps) {
  const { grid, max } = useMemo(() => {
    const g: Record<string, number> = {};
    let m = 0;
    for (const c of data) {
      g[`${c.dow}-${c.hour}`] = c.count;
      if (c.count > m) m = c.count;
    }
    return { grid: g, max: m };
  }, [data]);

  const intensity = (count: number) => {
    if (!count) return 0;
    if (!max) return 0;
    return 0.12 + 0.88 * (count / max);
  };

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* En-tête des heures */}
            <div className="flex pl-10">
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[9px] text-zinc-400 tabular-nums"
                >
                  {h % 3 === 0 ? h : ""}
                </div>
              ))}
            </div>

            {/* Lignes : un jour de semaine par ligne */}
            {DAYS.map((day, dow) => (
              <div key={dow} className="flex items-center">
                <div className="w-10 shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {day}
                </div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = grid[`${dow}-${hour}`] || 0;
                  const a = intensity(count);
                  return (
                    <div key={hour} className="flex-1 p-[2px]">
                      <div
                        className="aspect-square w-full rounded-[3px] bg-zinc-100 dark:bg-zinc-800"
                        style={a ? { backgroundColor: `rgba(99, 102, 241, ${a})` } : undefined}
                        title={`${day} ${hour}h — ${count.toLocaleString()} messages`}
                      />
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Légende */}
            <div className="flex items-center justify-end gap-2 mt-3 pr-1">
              <span className="text-[10px] text-zinc-400">Moins</span>
              {[0, 0.25, 0.5, 0.75, 1].map((a) => (
                <div
                  key={a}
                  className="h-3 w-3 rounded-[3px] bg-zinc-100 dark:bg-zinc-800"
                  style={a ? { backgroundColor: `rgba(99, 102, 241, ${0.12 + 0.88 * a})` } : undefined}
                />
              ))}
              <span className="text-[10px] text-zinc-400">Plus</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
