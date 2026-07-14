import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, subtitle, trend, color, onClick, className }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-0 shadow-sm bg-white dark:bg-zinc-900 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
            {subtitle && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
                {trend.positive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: color ? `${color}1a` : "rgba(99, 102, 241, 0.1)" }}
          >
            <Icon
              className="h-6 w-6"
              style={{ color: color || "rgb(99, 102, 241)" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
