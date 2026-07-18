"use client";

import { Calendar } from "lucide-react";

interface DateRangeInputsProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  disabled?: boolean;
}

export function DateRangeInputs({ from, to, onFromChange, onToChange, disabled }: DateRangeInputsProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        disabled={disabled}
        className="flex h-9 w-[140px] items-center rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      <span className="text-xs text-zinc-400">à</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        disabled={disabled}
        className="flex h-9 w-[140px] items-center rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
    </div>
  );
}
