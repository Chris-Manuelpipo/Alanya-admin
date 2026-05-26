"use client";

import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
}

export function BarChart({ data, title, color = "#6366f1" }: BarChartProps) {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBar data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(0 0 0 / 0.06)" vertical={false} />
              <XAxis
                dataKey="label"
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
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
