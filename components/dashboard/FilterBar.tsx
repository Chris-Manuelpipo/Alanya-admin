"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  showFilters: boolean;
  filters: FilterDef[];
  values: Record<string, string>;
  defaults: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

const selectClass =
  "flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder = "Rechercher...",
  showFilters,
  filters,
  values,
  defaults,
  onChange,
  onReset,
}: FilterBarProps) {
  const activeFilters = filters.filter((f) => values[f.key] !== defaults[f.key]);

  return (
    <div className="space-y-4">
      {/* Recherche détachée */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="rounded-lg border bg-white dark:bg-zinc-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Filtres</span>
            <button
              onClick={onReset}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Réinitialiser
            </button>
          </div>
          <div className="flex flex-wrap gap-4 p-4">
            {filters.map((f) => (
              <div key={f.key} className="space-y-1.5 min-w-[140px]">
                <label className="text-xs font-medium text-zinc-500">{f.label}</label>
                <select
                  value={values[f.key]}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className={selectClass}
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pilules de filtres actifs */}
      {!showFilters && activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => {
            const opt = f.options.find((o) => o.value === values[f.key]);
            return (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900"
              >
                {opt?.label ?? values[f.key]}
                <button
                  onClick={() => onChange(f.key, defaults[f.key])}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
