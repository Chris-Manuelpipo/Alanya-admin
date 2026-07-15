/** Période partagée pour tous les filtres date. */
export const PERIOD_OPTIONS = [
  { value: "", label: "Toutes les périodes" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "12m", label: "12 mois" },
] as const;

/** Convertit une valeur de période en dates from/to (ISO). */
export function periodToRange(period: string): { from: string; to: string } {
  const to = new Date().toISOString().split("T")[0];
  if (!period) {
    // "Toutes les périodes" — date très ancienne
    return { from: "2020-01-01", to };
  }
  const now = new Date();
  let days = 0;
  if (period.endsWith("d")) {
    days = parseInt(period);
  } else if (period === "12m") {
    days = 365;
  }
  if (isNaN(days) || days <= 0) return { from: "2020-01-01", to };
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString().split("T")[0], to };
}
