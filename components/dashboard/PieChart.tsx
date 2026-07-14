"use client";

import { useCallback, useState } from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector,
  type PieSectorDataItem,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#6366f1", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#a855f7", "#14b8a6", "#f97316", "#06b6d4"];

interface PieChartProps {
  data: { name: string; value: number }[];
  title: string;
}

const renderActiveShape = (props: PieSectorDataItem) => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "",
    payload,
  } = props;

  const p = payload as { name: string; value: number };

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-lg font-bold">
        {p.value.toLocaleString()}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {p.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius as number) + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
      />
    </g>
  );
};

const renderDefaultShape = (props: PieSectorDataItem) => {
  const { isActive } = props as PieSectorDataItem & { isActive?: boolean };
  return (
    <Sector
      {...(props as unknown as Record<string, unknown>)}
      outerRadius={isActive ? (props.outerRadius as number) + 5 : props.outerRadius}
    />
  );
};

export function PieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onMouseEnter = useCallback((_: PieSectorDataItem, index: number) => {
    setActiveIndex(index);
  }, []);

  const onMouseLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  const shapeFn = useCallback(
    (props: PieSectorDataItem & { index?: number }) => {
      if (props.index === activeIndex) {
        return renderActiveShape(props);
      }
      return renderDefaultShape(props);
    },
    [activeIndex]
  );

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                shape={shapeFn}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>
                )}
              />
            </RechartsPie>
          </ResponsiveContainer>
          {activeIndex === undefined && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: "-18px" }}>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums">{total.toLocaleString()}</p>
                <p className="text-xs text-zinc-400">Total</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
