"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangeInputs } from "@/components/ui/date-range-inputs";
import { PERIOD_OPTIONS } from "@/lib/period";
import type { Pays } from "@/types";

export interface BroadcastFilterState {
  search: string;
  kind: string;
  type: string;
  status: string;
  idPays: string;
  period: string;
  dateFrom: string;
  dateTo: string;
  sort: string;
  order: string;
}

interface BroadcastFiltersProps {
  filters: BroadcastFilterState;
  countries?: Pays[];
  isFetching: boolean;
  showFilters: boolean;
  onShowFiltersChange: (open: boolean) => void;
  onSearchChange: (value: string) => void;
  onFilterChange: <K extends keyof BroadcastFilterState>(key: K, value: BroadcastFilterState[K]) => void;
  onReset: () => void;
}

const kindOptions = [
  { value: "", label: "Tous" },
  { value: "0", label: "Message" },
  { value: "1", label: "Statut" },
];

const typeOptions = [
  { value: "", label: "Tous" },
  { value: "0", label: "Texte" },
  { value: "1", label: "Image" },
  { value: "2", label: "Vidéo" },
];

const statusOptions = [
  { value: "", label: "Tous" },
  { value: "active", label: "En cours" },
  { value: "completed", label: "Terminée" },
  { value: "partial_failed", label: "Échec partiel" },
];

const sortOptions = [
  { value: "sent_at", label: "Date d'envoi" },
  { value: "estimate", label: "Destinataires" },
];

const selectClassName =
  "flex h-9 w-full items-center rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

export function hasActiveBroadcastFilters(filters: BroadcastFilterState): boolean {
  return Boolean(
    filters.search ||
      filters.kind ||
      filters.type ||
      filters.status ||
      filters.idPays ||
      filters.period ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.sort !== "sent_at" ||
      filters.order !== "desc",
  );
}

export function BroadcastFilters({
  filters,
  countries,
  isFetching,
  showFilters,
  onShowFiltersChange,
  onSearchChange,
  onFilterChange,
  onReset,
}: BroadcastFiltersProps) {
  const active = hasActiveBroadcastFilters(filters);
  const countryLabel = countries?.find((c) => String(c.idPays) === filters.idPays)?.libelle;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher dans le contenu…"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            disabled={isFetching}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowFiltersChange(!showFilters)}
          className={showFilters ? "bg-indigo-50 dark:bg-indigo-950" : ""}
        >
          <SlidersHorizontal className="mr-1 h-4 w-4" />
          Filtres
        </Button>
      </div>

      {showFilters && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Filtres</span>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Réinitialiser
            </button>
          </div>
          <div className="flex flex-wrap gap-4 p-4">
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Format</label>
              <select
                value={filters.kind}
                onChange={(e) => onFilterChange("kind", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                {kindOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Média</label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange("type", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                {typeOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                {statusOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pays ciblé</label>
              <select
                value={filters.idPays}
                onChange={(e) => onFilterChange("idPays", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                <option value="">Tous</option>
                {(countries ?? []).map((c) => (
                  <option key={c.idPays} value={String(c.idPays)}>
                    {c.libelle}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Période</label>
              <select
                value={filters.period}
                onChange={(e) => onFilterChange("period", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Dates</label>
              <DateRangeInputs
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={(v) => onFilterChange("dateFrom", v)}
                onToChange={(v) => onFilterChange("dateTo", v)}
                disabled={isFetching}
              />
            </div>
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Trier par</label>
              <select
                value={filters.sort}
                onChange={(e) => onFilterChange("sort", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Ordre</label>
              <select
                value={filters.order}
                onChange={(e) => onFilterChange("order", e.target.value)}
                className={selectClassName}
                disabled={isFetching}
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {active && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && (
            <FilterBadge label={`« ${filters.search} »`} onClear={() => onSearchChange("")} />
          )}
          {filters.kind && (
            <FilterBadge
              label={kindOptions.find((o) => o.value === filters.kind)?.label ?? filters.kind}
              onClear={() => onFilterChange("kind", "")}
            />
          )}
          {filters.type && (
            <FilterBadge
              label={typeOptions.find((o) => o.value === filters.type)?.label ?? filters.type}
              onClear={() => onFilterChange("type", "")}
            />
          )}
          {filters.status && (
            <FilterBadge
              label={statusOptions.find((o) => o.value === filters.status)?.label ?? filters.status}
              onClear={() => onFilterChange("status", "")}
            />
          )}
          {filters.idPays && (
            <FilterBadge label={countryLabel ?? filters.idPays} onClear={() => onFilterChange("idPays", "")} />
          )}
          {filters.period && (
            <FilterBadge
              label={PERIOD_OPTIONS.find((o) => o.value === filters.period)?.label ?? filters.period}
              onClear={() => {
                onFilterChange("period", "");
              }}
            />
          )}
          {!filters.period && (filters.dateFrom || filters.dateTo) && (
            <FilterBadge
              label={`${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`}
              onClear={() => {
                onFilterChange("dateFrom", "");
                onFilterChange("dateTo", "");
              }}
            />
          )}
          {filters.sort !== "sent_at" && (
            <FilterBadge
              label={`Tri: ${sortOptions.find((o) => o.value === filters.sort)?.label ?? filters.sort}`}
              onClear={() => onFilterChange("sort", "sent_at")}
            />
          )}
          {filters.order !== "desc" && (
            <FilterBadge label="Croissant" onClear={() => onFilterChange("order", "desc")} />
          )}
        </div>
      )}
    </div>
  );
}

function FilterBadge({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="hover:text-indigo-900 dark:hover:text-indigo-100"
        aria-label={`Retirer le filtre ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
