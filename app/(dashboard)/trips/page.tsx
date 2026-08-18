"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { PieChart } from "@/components/dashboard/PieChart";
import { TripsContentSkeleton } from "@/components/skeletons";
import { useTripStats } from "@/hooks/useTripStats";
import { Button } from "@/components/ui/button";
import { DateRangeInputs } from "@/components/ui/date-range-inputs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERIOD_OPTIONS, periodToRange } from "@/lib/period";
import {
  Route,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  RefreshCw,
  EyeOff,
  Eraser,
} from "lucide-react";

const KIND_LABELS: Record<string, string> = {
  taxi: "Taxi",
  walk: "À pied",
  sos: "SOS",
};

const REASON_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  confirmed_after_alert: "Confirmé après alerte",
  false_alarm: "Fausse alerte",
  stopped_by_owner: "Arrêté",
  max_duration: "Plafond de durée",
  no_watcher: "Sans destinataire",
  sos: "SOS",
  unknown: "Autre",
};

function formatDuration(sec: number): string {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  if (m) return `${m} min`;
  return "< 1 min";
}

function formatPct(n: number): string {
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

function trend(current: number, previous: number) {
  if (!previous) return undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: pct, positive: pct >= 0 };
}

export default function TripsPage() {
  const router = useRouter();
  const defaultRange = periodToRange("7d");
  const [period, setPeriod] = useState("7d");
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);

  function handlePeriodChange(value: string) {
    setPeriod(value);
    const { from, to } = periodToRange(value);
    setDateFrom(from);
    setDateTo(to);
  }

  function handleDateFromChange(value: string) {
    setPeriod("");
    setDateFrom(value);
  }

  function handleDateToChange(value: string) {
    setPeriod("");
    setDateTo(value);
  }

  const { data, isLoading, isFetching, isError, refetch } = useTripStats(dateFrom, dateTo);

  const kindPie = useMemo(
    () =>
      (data?.byKind ?? []).map((k) => ({
        name: KIND_LABELS[k.kind] ?? k.kind,
        value: k.count,
      })),
    [data],
  );

  const reasonPie = useMemo(
    () =>
      (data?.byCloseReason ?? []).map((r) => ({
        name: REASON_LABELS[r.reason] ?? r.reason,
        value: r.count,
      })),
    [data],
  );

  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-6 w-6 text-indigo-500" />
            Trajets
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Compteurs agrégés — aucune identité, aucune carte
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            disabled={isLoading}
            className="flex h-10 w-44 items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
          <DateRangeInputs
            from={dateFrom}
            to={dateTo}
            onFromChange={handleDateFromChange}
            onToChange={handleDateToChange}
            disabled={isLoading}
          />
          <Button variant="outline" onClick={() => router.push("/trips/retention")} className="shrink-0">
            <Eraser className="h-4 w-4 mr-2" />
            Rétention
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} className="shrink-0">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {!isError && showSkeleton && <TripsContentSkeleton />}

      {!isError && !showSkeleton && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Trajets démarrés"
              value={data.started}
              icon={Route}
              color="#6366f1"
              subtitle={`${data.openNow.toLocaleString("fr-FR")} ouverts maintenant`}
              trend={trend(data.started, data.startedPrevious)}
            />
            <StatCard
              title="Confirmés"
              value={formatPct(data.confirmedRate)}
              icon={CheckCircle2}
              color="#22c55e"
              subtitle={`${data.confirmed.toLocaleString("fr-FR")} sur ${data.started.toLocaleString("fr-FR")}`}
            />
            <StatCard
              title="Clos par une alerte"
              value={data.alerted}
              icon={AlertTriangle}
              color="#ef4444"
              subtitle={`${formatPct(data.alertedRate)} · dont ${data.sos.toLocaleString("fr-FR")} SOS`}
            />
            <StatCard
              title="Durée médiane"
              value={formatDuration(data.durationMedianSec)}
              icon={Clock}
              color="#8b5cf6"
              subtitle={`p90 · ${formatDuration(data.durationP90Sec)}`}
            />
            <StatCard
              title="Prolongations"
              value={data.avgExtensions.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
              icon={Plus}
              color="#f59e0b"
              subtitle="par trajet clos"
            />
            <StatCard
              title="Alertes levées"
              value={`${data.alertsResolved.toLocaleString("fr-FR")} sur ${data.alertsClosed.toLocaleString("fr-FR")}`}
              icon={ShieldCheck}
              color="#14b8a6"
              subtitle={`délai médian ${formatDuration(data.alertsResolvedMedianSec)}`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AreaChart data={data.startedByDay} title="Trajets démarrés par jour" color="#6366f1" />
            </div>
            <PieChart data={kindPie} title="Par type" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart data={reasonPie} title="Issues (trajets clos)" />
            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-zinc-400" />
                  Cette page ne montrera jamais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-zinc-500 dark:text-zinc-400 space-y-2 list-disc pl-4">
                  <li>Aucune coordonnée, aucune trace, aucune destination.</li>
                  <li>Aucun nom, aucun identifiant de compte, aucun cercle.</li>
                  <li>Aucun trajet individuel — même clos par une alerte.</li>
                  <li>Aucune carte. Le suivi live reste dans l&apos;application.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
