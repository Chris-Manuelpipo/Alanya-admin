"use client";

import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Series {
  key: string;
  label: string;
  color: string;
}

interface StackedBarChartProps {
  data: Record<string, string | number>[];
  title: string;
  xKey: string;
  series: Series[];
  /** Formate le libellé de l'axe X (ex: date → "lun. 3") */
  formatX?: (value: string) => string;
}

export function StackedBarChart({ data, title, xKey, series, formatX }: StackedBarChartProps) {
  const formatted = formatX
    ? data.map((d) => ({ ...d, [xKey]: formatX(String(d[xKey])) }))
    : data;

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBar data={formatted} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(0 0 0 / 0.06)" vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12, fill: "rgb(0 0 0 / 0.4)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "rgb(0 0 0 / 0.4)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={28}
                formatter={(value: string) => (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>
                )}
              />
              {series.map((s, idx) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stackId="a"
                  fill={s.color}
                  radius={idx === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
