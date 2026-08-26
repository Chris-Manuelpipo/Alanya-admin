"use client";

/**
 * Rétention des traces GPS.
 *
 * Cet écran répond à une seule question — « combien de traces dorment encore
 * en base, et quand disparaissent-elles ? » — et permet de ne pas attendre la
 * nuit pour les effacer. Il ne montre aucun trajet, aucune position, aucune
 * identité : une purge ne doit pas pouvoir servir à viser quelqu'un.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TripRetentionContentSkeleton } from "@/components/skeletons";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useRunTripPurge, useTripRetention } from "@/hooks/useTripStats";
import type { TripPurgeRun } from "@/types";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Database,
  Eraser,
  EyeOff,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from "lucide-react";

type Scope = "retention" | "all";

const SCOPE_LABELS: Record<Scope, string> = {
  retention: "Rétention appliquée",
  all: "Purge totale",
};

function n(value: number): string {
  return value.toLocaleString("fr-FR");
}

/** 720 h se lit « 30 jours ». Un chiffre en heures ne se vérifie pas d'un œil. */
function humanHours(hours: number): string {
  if (hours % 24 === 0) {
    const d = hours / 24;
    return `${n(d)} jour${d > 1 ? "s" : ""}`;
  }
  return `${n(hours)} heure${hours > 1 ? "s" : ""}`;
}

function humanDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function TripRetentionPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { can } = usePermissions();
  const isSuper = can("trips.purge");
  const { data, isLoading, isFetching, isError, refetch } = useTripRetention();
  const purge = useRunTripPurge();
  const [confirm, setConfirm] = useState<Scope | null>(null);

  // Même règle que la page Trajets : le squelette couvre le premier chargement
  // et un rafraîchissement qui n'a encore rien à afficher, jamais un simple
  // refetch en fond — sinon les compteurs clignoteraient à chaque purge.
  const showSkeleton = isLoading || (isFetching && !data);

  async function handlePurge(scope: Scope) {
    try {
      const res = await purge.mutateAsync(scope);
      const run = res.lastRun;
      setConfirm(null);
      addToast({
        title: "Purge effectuée",
        description: run
          ? `${n(run.points)} positions effacées, ${n(run.trips)} trajets marqués`
          : "Traces effacées",
        variant: "success",
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "La purge n'a pas abouti";
      addToast({ title: "Échec", description: msg, variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/trips")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Eraser className="h-6 w-6 text-indigo-500" />
              Rétention des traces
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Des volumes, jamais un trajet — aucune position, aucune identité
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {!isError && showSkeleton && <TripRetentionContentSkeleton />}

      {!isError && !showSkeleton && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Positions stockées"
              value={data.stored.points}
              icon={Database}
              color="#6366f1"
              subtitle={`${n(data.stored.trips)} trajets concernés`}
            />
            <StatCard
              title="Échues, à purger"
              value={data.expired.points}
              icon={CalendarClock}
              color="#f59e0b"
              subtitle={`${n(data.expired.trips)} trajets · effacées la nuit prochaine`}
            />
            <StatCard
              title="Trajets clos avec trace"
              value={data.closed.trips}
              icon={Clock}
              color="#8b5cf6"
              subtitle={`${n(data.closed.points)} positions — ce qu'une purge totale efface`}
            />
            <StatCard
              title="Trajets déjà purgés"
              value={data.purgedTrips}
              icon={Trash2}
              color="#22c55e"
              subtitle="résumé et frise toujours disponibles"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Politique en vigueur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Line
                  label="Trace d'un trajet ordinaire"
                  value={humanHours(data.policy.pointsHours)}
                />
                <Line
                  label="Trace d'un trajet clos sur une alerte"
                  value={`${n(data.policy.pointsIncidentDays)} jours`}
                />
                <Line
                  label="Le trajet lui-même (résumé, frise)"
                  value={`${n(data.policy.tripMonths)} mois`}
                />
                <Line label="Position la plus ancienne en base" value={humanDate(data.stored.oldestPointAt)} />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t">
                  Le balayage automatique passe une fois par jour. Ces durées se règlent côté
                  serveur (<code className="font-mono">TRIP_POINTS_RETENTION_H</code>,
                  {" "}<code className="font-mono">TRIP_POINTS_INCIDENT_D</code>) — pas depuis
                  cet écran, pour qu&apos;un accès admin compromis ne puisse pas allonger
                  silencieusement la conservation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Purge manuelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Appliquer la rétention maintenant</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Efface les {n(data.expired.points)} positions déjà échues, sans attendre le
                    balayage de la nuit. Exactement ce que le serveur ferait seul.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={!isSuper || purge.isPending || data.expired.points === 0}
                    onClick={() => setConfirm("retention")}
                  >
                    Purger les traces échues
                  </Button>
                </div>

                <div className="space-y-1 pt-3 border-t">
                  <p className="text-sm font-medium">Effacer toutes les traces closes</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Efface les {n(data.closed.points)} positions de tous les trajets clos, échéance
                    ou non — y compris celles d&apos;un trajet clos sur une alerte, qui peuvent
                    être une preuve. Les trajets en cours ne sont jamais touchés.
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-2"
                    disabled={!isSuper || purge.isPending || data.closed.points === 0}
                    onClick={() => setConfirm("all")}
                  >
                    Tout purger
                  </Button>
                </div>

                {!isSuper && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 pt-2 border-t">
                    Lecture seule : la purge manuelle est réservée au super-admin.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Dernières purges</CardTitle>
              </CardHeader>
              <CardContent>
                {data.runs.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Aucune purge manuelle enregistrée. Le balayage automatique, lui, n&apos;apparaît
                    pas ici — il tourne chaque nuit.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {data.runs.map((run: TripPurgeRun) => (
                      <li key={`${run.at}-${run.scope}`} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={run.scope === "all" ? "destructive" : "secondary"}>
                              {SCOPE_LABELS[run.scope]}
                            </Badge>
                            <span className="text-sm">{humanDate(run.at)}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {run.by ? `par ${run.by}` : "auteur inconnu"}
                          </p>
                        </div>
                        <p className="text-sm tabular-nums shrink-0 text-right">
                          {n(run.points)} positions
                          <span className="block text-xs text-zinc-500">
                            {n(run.trips)} trajets marqués
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-zinc-400" />
                  Ce que la purge ne fait pas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-zinc-500 dark:text-zinc-400 space-y-2 list-disc pl-4">
                  <li>Elle ne supprime aucun trajet : le résumé et la frise restent.</li>
                  <li>Elle ne touche jamais un trajet en cours.</li>
                  <li>Elle ne cible personne — ni compte, ni trajet précis.</li>
                  <li>Elle est irréversible : une trace effacée ne revient pas.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirm === "retention"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Purger les traces échues"
        description={
          data
            ? `${n(data.expired.points)} positions (${n(data.expired.trips)} trajets) seront effacées définitivement. Les résumés restent.`
            : undefined
        }
        confirmLabel="Purger"
        pending={purge.isPending}
        onConfirm={() => handlePurge("retention")}
      />

      <ConfirmDialog
        open={confirm === "all"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Effacer toutes les traces closes"
        description={
          data
            ? `${n(data.closed.points)} positions (${n(data.closed.trips)} trajets) seront effacées définitivement, avant leur échéance — traces d'incident comprises. C'est irréversible.`
            : undefined
        }
        confirmLabel="Tout purger"
        variant="destructive"
        pending={purge.isPending}
        onConfirm={() => handlePurge("all")}
      />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-medium tabular-nums text-right">{value}</span>
    </div>
  );
}
