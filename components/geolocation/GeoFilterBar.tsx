"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangeInputs } from "@/components/ui/date-range-inputs";
import { PERIOD_OPTIONS } from "@/lib/period";

interface GeoFilterBarProps {
  period: string;
  onPeriodChange: (period: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  isFetching: boolean;
  onRefresh: () => void;
}

export function GeoFilterBar({ period, onPeriodChange, dateFrom, dateTo, onDateFromChange, onDateToChange, isFetching, onRefresh }: GeoFilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value)}
        disabled={isFetching}
        className="flex h-10 w-44 items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {PERIOD_OPTIONS.filter((o) => o.value !== "12m").map((o) => (
          <option key={o.value || "all"} value={o.value}>{o.label}</option>
        ))}
      </select>
      <DateRangeInputs from={dateFrom} to={dateTo} onFromChange={onDateFromChange} onToChange={onDateToChange} disabled={isFetching} />
      <Button variant="outline" size="icon" onClick={onRefresh} disabled={isFetching} className="shrink-0">
        <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}
