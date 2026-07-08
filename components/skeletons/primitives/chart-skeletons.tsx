import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stagger } from "./stagger";
import { BAR_HEIGHTS } from "./variable-widths";

function ChartCardShell({
  children,
  titleWidth = "w-40",
  ariaLabel,
}: {
  children: React.ReactNode;
  titleWidth?: string;
  ariaLabel?: string;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900" aria-busy="true" aria-label={ariaLabel}>
      <CardHeader className="pb-2">
        <Skeleton className={cn("h-5 rounded", titleWidth)} />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ChartAxes({
  children,
  xTicks = 7,
}: {
  children: React.ReactNode;
  xTicks?: number;
}) {
  return (
    <div className="h-72 flex gap-2">
      <div className="flex flex-col justify-between py-1 w-8 shrink-0">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-2 w-6 rounded" />
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">{children}</div>
        <div className="flex justify-between pt-2 gap-1">
          {Array.from({ length: xTicks }).map((_, i) => (
            <Skeleton key={i} className="h-2 flex-1 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Courbe lissée + aire remplie (comme Recharts Area type="monotone"). */
function AreaCurvePlot() {
  const linePath =
    "M 0 118 C 18 118 22 78 40 82 S 58 48 76 54 S 94 88 112 72 S 130 58 148 64 S 166 92 184 76 S 202 68 220 74 S 238 86 256 70 L 280 62";
  const areaPath = `${linePath} L 280 200 L 0 200 Z`;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-sm">
      <svg
        viewBox="0 0 280 200"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="areaSkeletonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--skeleton))" stopOpacity="0.42" />
            <stop offset="95%" stopColor="hsl(var(--skeleton))" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[50, 100, 150].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="280"
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.65"
          />
        ))}
        <path d={areaPath} fill="url(#areaSkeletonFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="hsl(var(--skeleton))"
          strokeWidth="2.5"
          strokeOpacity="0.72"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 skeleton-shimmer opacity-25" aria-hidden />
    </div>
  );
}

export function AreaChartSkeleton({ ariaLabel = "Chargement du graphique" }: { ariaLabel?: string }) {
  return (
    <ChartCardShell titleWidth="w-44" ariaLabel={ariaLabel}>
      <ChartAxes>
        <AreaCurvePlot />
      </ChartAxes>
    </ChartCardShell>
  );
}

export function BarChartSkeleton({ ariaLabel = "Chargement du graphique" }: { ariaLabel?: string }) {
  return (
    <ChartCardShell titleWidth="w-48" ariaLabel={ariaLabel}>
      <ChartAxes>
        <div className="absolute inset-0 flex items-end justify-around gap-4 px-4">
          {[65, 45, 80].map((h, i) => (
            <Skeleton
              key={i}
              className="w-16 rounded-t-md"
              style={{ height: `${h}%`, animationDelay: stagger(i) }}
            />
          ))}
        </div>
      </ChartAxes>
    </ChartCardShell>
  );
}

export function PieChartSkeleton({ ariaLabel = "Chargement du graphique" }: { ariaLabel?: string }) {
  return (
    <ChartCardShell titleWidth="w-36" ariaLabel={ariaLabel}>
      <div className="h-72 flex flex-col items-center justify-center gap-4">
        <Skeleton className="h-36 w-36 rounded-full" />
        <div className="flex flex-wrap justify-center gap-3 w-full px-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-16 rounded-full" style={{ animationDelay: stagger(i) }} />
          ))}
        </div>
      </div>
    </ChartCardShell>
  );
}

export function StackedBarChartSkeleton({ ariaLabel = "Chargement du graphique" }: { ariaLabel?: string }) {
  return (
    <ChartCardShell titleWidth="w-52" ariaLabel={ariaLabel}>
      <ChartAxes>
        <div className="absolute inset-0 flex items-end gap-2 px-1">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-0.5" style={{ height: "100%" }}>
              <Skeleton className="w-full rounded-t-sm" style={{ height: `calc(${h} * 0.4)`, animationDelay: stagger(i) }} />
              <Skeleton className="w-full rounded-t-sm" style={{ height: `calc(${h} * 0.35)`, animationDelay: stagger(i) }} />
            </div>
          ))}
        </div>
      </ChartAxes>
    </ChartCardShell>
  );
}

export function HeatmapChartSkeleton({ ariaLabel = "Chargement de la heatmap" }: { ariaLabel?: string }) {
  return (
    <ChartCardShell titleWidth="w-56" ariaLabel={ariaLabel}>
      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-1">
          <div className="flex pl-10 gap-0.5">
            {Array.from({ length: 24 }).map((_, h) => (
              <Skeleton key={h} className="flex-1 h-2 rounded-sm" />
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, dow) => (
            <div key={dow} className="flex items-center gap-1">
              <Skeleton className="w-10 h-3 rounded shrink-0" />
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: 24 }).map((_, h) => (
                  <Skeleton
                    key={h}
                    className="flex-1 aspect-square rounded-sm"
                    style={{ animationDelay: stagger(dow * 3 + h) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCardShell>
  );
}

export function SectionTitleSkeleton() {
  return <Skeleton className="h-6 w-36 rounded mt-2" />;
}
