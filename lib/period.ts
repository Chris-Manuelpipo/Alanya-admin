/** Période partagée pour tous les filtres date. */
export const PERIOD_OPTIONS = [
  { value: "", label: "Toutes les périodes" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "12m", label: "12 mois" },
] as const;

/** Convertit une valeur de période en dates from/to (ISO date YYYY-MM-DD). */
export function periodToRange(period: string): { from: string; to: string } {
  const to = new Date().toISOString().split("T")[0];
  if (!period) {
    return { from: "2020-01-01", to };
  }

  const now = new Date();
  let days = 0;
  if (period === "12m") {
    days = 365;
  } else if (period.endsWith("d")) {
    days = parseInt(period, 10);
  } else if (/^\d+$/.test(period)) {
    // Compat : certains écrans envoient "7" au lieu de "7d"
    days = parseInt(period, 10);
  }

  if (isNaN(days) || days <= 0) return { from: "2020-01-01", to };

  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString().split("T")[0], to };
}

/** Borne inclusive pour les requêtes API (jour entier pour `to`). */
export function normalizeApiDateRange(from?: string, to?: string): { from: string; to: string } {
  const today = new Date().toISOString().split("T")[0];
  const fromDate = (from?.split("T")[0] || periodToRange("7d").from);
  const toDate = to?.split("T")[0] || today;
  return {
    from: `${fromDate}T00:00:00.000Z`,
    to: `${toDate}T23:59:59.999Z`,
  };
}
