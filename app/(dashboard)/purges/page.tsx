"use client";

/**
 * Purges de rétention.
 *
 * Ces cinq balayages suppriment définitivement des fichiers et des lignes.
 * Cet écran répond à trois questions qu'on ne pouvait pas poser avant :
 * qu'est-ce qui va être supprimé, est-ce que ça tourne vraiment, et comment
 * l'arrêter sans redéployer.
 *
 * L'ordre à l'écran est délibéré : la volumétrie d'abord, l'interrupteur
 * ensuite. On ne coupe ni ne relance une purge sans avoir vu ce qu'elle
 * s'apprête à faire.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useIsSuperAdmin } from "@/hooks/useAdminUser";
import { usePurges, useRunPurge, useUpdatePurge } from "@/hooks/usePurges";
import type { PurgeRun, PurgeSetting } from "@/types";
import {
  AlertTriangle, CheckCircle2, Clock, Eraser, Loader2,
  Power, RefreshCw, ShieldAlert, XCircle,
} from "lucide-react";

const octets = (n: number) => {
  if (!n) return "0 o";
  const u = ["o", "Ko", "Mo", "Go"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
};

const dateCourte = (s: string | null) =>
  s ? new Date(s).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

/**
 * Résumé lisible de « ce qui serait supprimé ». La forme des statistiques
 * varie d'une purge à l'autre (fichiers + octets pour les médias, lignes par
 * table pour la rétention générale…) : on traduit ici plutôt que d'imposer
 * un schéma commun côté serveur qui aurait aplati l'information utile.
 */
function resumeStats(p: PurgeSetting): { total: number; lignes: string[] } {
  const s = p.stats as Record<string, never> | null;
  if (!s) return { total: 0, lignes: [] };

  if (p.name === "media") {
    const f = Number(s.fichiers) || 0;
    return {
      total: f,
      lignes: [
        `${f} fichier${f > 1 ? "s" : ""} — ${octets(Number(s.octets) || 0)}`,
        s.plusAncien ? `plus ancien : ${dateCourte(String(s.plusAncien))}` : "",
      ].filter(Boolean),
    };
  }

  if (p.name === "data_retention") {
    // Tableau et non objet indexé : les noms de tables sont des valeurs, pour
    // survivre à la conversion camelCase appliquée aux clés par lib/api.ts.
    const cibles = (s.parCible || []) as Array<{
      table: string; lignes?: number; retention?: string; erreur?: string;
    }>;
    const total = cibles.reduce((acc, c) => acc + (c.lignes || 0), 0);
    return {
      total,
      lignes: cibles
        .filter((c) => (c.lignes || 0) > 0 || c.erreur)
        .map((c) => (c.erreur
          ? `${c.table} : erreur`
          : `${c.table} : ${c.lignes} ligne(s) (> ${c.retention})`)),
    };
  }

  if (p.name === "trip") {
    const exp = (s.expired || {}) as { points?: number; trips?: number };
    const sto = (s.stored || {}) as { points?: number; trips?: number };
    return {
      total: (exp.points || 0) + (exp.trips || 0),
      lignes: [
        `${exp.points || 0} point(s) GPS et ${exp.trips || 0} trajet(s) échus`,
        `en base : ${sto.points || 0} point(s), ${sto.trips || 0} trajet(s)`,
      ],
    };
  }

  const l = Number(s.lignes) || 0;
  const suffixe = s.retentionFigee ? ` (> ${s.retentionFigee})` : "";
  return { total: l, lignes: [`${l} ligne${l > 1 ? "s" : ""}${suffixe}`] };
}

function LigneHistorique({ run }: { run: PurgeRun }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {run.ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
      )}
      <span className="tabular-nums">{dateCourte(run.ranAt)}</span>
      <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
        {run.triggerSource === "manual" ? "manuelle" : "auto"}
      </Badge>
      {run.byAdmin && <span className="truncate">par {run.byAdmin}</span>}
      {run.durationMs != null && <span className="tabular-nums">{run.durationMs} ms</span>}
      {run.error && <span className="truncate text-destructive">{run.error}</span>}
    </div>
  );
}

function CartePurge({ purge, superAdmin }: { purge: PurgeSetting; superAdmin: boolean }) {
  const { addToast } = useToast();
  const maj = useUpdatePurge();
  const run = useRunPurge();
  const [confirme, setConfirme] = useState(false);
  const [brouillon, setBrouillon] = useState<Record<string, string>>({});

  const { total, lignes } = resumeStats(purge);
  const enCours = maj.isPending || run.isPending;

  const basculer = () => {
    maj.mutate(
      { name: purge.name, enabled: !purge.enabled },
      {
        onSuccess: (r) =>
          addToast({
            title: r.enabled ? "Purge réactivée" : "Purge désactivée",
            description: r.enabled
              ? "Le balayage automatique reprend au prochain tour."
              : "Le balayage automatique ne s'exécutera plus. La purge manuelle reste possible.",
          }),
        onError: () => addToast({ title: "Échec de la mise à jour", variant: "error" }),
      },
    );
  };

  const enregistrerReglages = () => {
    const overrides: Record<string, number | null> = {};
    for (const k of purge.knobs) {
      const v = brouillon[k.key];
      if (v === undefined) continue;
      overrides[k.key] = v === "" ? null : Number(v);
    }
    if (!Object.keys(overrides).length) return;
    maj.mutate(
      { name: purge.name, overrides },
      {
        onSuccess: () => {
          setBrouillon({});
          addToast({ title: "Durées mises à jour" });
        },
        onError: () => addToast({ title: "Échec de la mise à jour", variant: "error" }),
      },
    );
  };

  return (
    <Card className={purge.enabled ? "" : "border-dashed opacity-90"}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            {purge.label}
            {purge.enabled ? (
              <Badge variant="outline" className="text-emerald-600">active</Badge>
            ) : (
              <Badge variant="destructive">désactivée</Badge>
            )}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{purge.description}</p>
        </div>
        {superAdmin && (
          <Button
            variant={purge.enabled ? "outline" : "default"}
            size="sm"
            disabled={enCours}
            onClick={basculer}
            className="shrink-0"
          >
            <Power className="mr-1.5 h-4 w-4" />
            {purge.enabled ? "Désactiver" : "Activer"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Volumétrie — délibérément avant les commandes. */}
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium">
            {total > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            {purge.statsErreur
              ? "Comptage indisponible"
              : total > 0
                ? "Serait supprimé au prochain passage"
                : "Rien à supprimer"}
          </div>
          {purge.statsErreur ? (
            <p className="text-xs text-destructive">{purge.statsErreur}</p>
          ) : (
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {lignes.map((l) => <li key={l}>{l}</li>)}
            </ul>
          )}
        </div>

        {/* Durées de rétention */}
        {purge.knobs.length > 0 ? (
          <div className="space-y-2">
            {purge.knobs.map((k) => (
              <div key={k.key} className="flex flex-wrap items-center gap-2 text-sm">
                <label className="min-w-[13rem] text-muted-foreground" htmlFor={`${purge.name}-${k.key}`}>
                  {k.label}
                </label>
                <input
                  id={`${purge.name}-${k.key}`}
                  type="number"
                  min={k.min}
                  max={k.max}
                  disabled={!superAdmin || enCours}
                  value={brouillon[k.key] ?? String(k.valeur)}
                  onChange={(e) => setBrouillon((b) => ({ ...b, [k.key]: e.target.value }))}
                  className="h-8 w-24 rounded-md border bg-background px-2 tabular-nums"
                />
                <span className="text-xs text-muted-foreground">
                  {k.unit} · défaut {k.defaut} · min {k.min} / max {k.max}
                </span>
              </div>
            ))}
            {superAdmin && Object.keys(brouillon).length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={enregistrerReglages} disabled={enCours}>
                  Enregistrer les durées
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setBrouillon({})} disabled={enCours}>
                  Annuler
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Durées figées dans le code pour cette purge — non modifiables ici.
          </p>
        )}

        {/* Historique : c'est lui qui distingue « rien à faire » de « ne tourne pas ». */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Dernières exécutions
          </div>
          {purge.runs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aucune exécution enregistrée — le journal ne démarre qu&apos;avec cette version.
            </p>
          ) : (
            purge.runs.map((r) => <LigneHistorique key={r.id} run={r} />)
          )}
        </div>

        {superAdmin && (
          <div className="flex items-center gap-2 border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={enCours}
              onClick={() => setConfirme(true)}
            >
              {run.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Eraser className="mr-1.5 h-4 w-4" />
              )}
              Purger maintenant
            </Button>
            {!purge.enabled && (
              <span className="text-xs text-muted-foreground">
                Possible même désactivée : seul le balayage automatique est coupé.
              </span>
            )}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirme}
        onOpenChange={setConfirme}
        title={`Purger « ${purge.label} » maintenant ?`}
        description={
          total > 0
            ? `${lignes.join(" · ")}. Cette suppression est définitive.`
            : "Rien ne semble à supprimer pour l'instant : l'exécution sera sans effet."
        }
        confirmLabel="Purger"
        variant="destructive"
        onConfirm={() => {
          setConfirme(false);
          run.mutate(purge.name, {
            onSuccess: () => addToast({ title: `Purge « ${purge.label} » exécutée` }),
            onError: (e: unknown) =>
              addToast({
                title: "Échec de la purge",
                description: e instanceof Error ? e.message : undefined,
                variant: "error",
              }),
          });
        }}
      />
    </Card>
  );
}

export default function PurgesPage() {
  const superAdmin = useIsSuperAdmin();
  const { data, isLoading, isFetching, isError, refetch } = usePurges();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purges de rétention</h1>
          <p className="text-sm text-muted-foreground">
            Ce que le serveur supprime automatiquement, et quand. Les suppressions sont définitives.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      {!superAdmin && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          Lecture seule : seul un super-administrateur peut modifier ou déclencher une purge.
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Impossible de charger les purges. La migration 068 a-t-elle été appliquée ?
        </p>
      )}

      <div className="grid gap-4">
        {(data || []).map((p) => (
          <CartePurge key={p.name} purge={p} superAdmin={superAdmin} />
        ))}
      </div>
    </div>
  );
}
