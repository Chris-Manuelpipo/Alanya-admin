"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DatabaseBackup, RefreshCw, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsersTableRowsSkeleton } from "@/components/skeletons";
import { useBackupOverview, useBackupKeyUsage } from "@/hooks/useBackupKeys";
import { fetchUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type Filtre = "never" | "stale" | "recent";

const LIBELLES: Record<Filtre, string> = {
  never: "Jamais sauvegardé",
  stale: "Sauvegarde périmée",
  recent: "À jour",
};

/**
 * Sauvegardes du parc.
 *
 * ── Ce que cet écran peut, et ne peut pas ──
 *
 * Le serveur ne détient AUCUNE sauvegarde : elles sont sur le Drive de
 * l'inscrit ou dans son dossier `Téléchargements`. Il n'en garde qu'un
 * descriptif. On ne peut donc ni télécharger, ni restaurer, ni supprimer la
 * sauvegarde de quelqu'un, ni en déclencher une à distance — elle part du
 * téléphone, à l'ouverture de l'application.
 *
 * C'est le prix du choix de conception initial : garder les données chez
 * l'inscrit, épargner sa bande passante. L'administration constate.
 *
 * ── Et ce que constater sert à quelque chose ──
 *
 * Un compte sans sauvegarde perdra tout son historique au changement de
 * téléphone. Aujourd'hui rien ne le signale, ni à lui, ni à vous. Cet écran
 * répond d'abord à cette question-là.
 */
export default function BackupsPage() {
  const router = useRouter();
  const [filtre, setFiltre] = useState<Filtre>("never");

  const { data: vue, isFetching, refetch } = useBackupOverview();
  const { data: cles } = useBackupKeyUsage();

  const { data: liste, isLoading } = useQuery({
    queryKey: ["users", "backup", filtre],
    queryFn: () => fetchUsers({ backup: filtre, limit: 50, sort: "backup_last_at", order: "asc" }),
    staleTime: 30_000,
  });

  const comptes: User[] = liste?.items ?? [];
  const alerte = vue != null && vue.comptes > 0 && vue.couverture < 50;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <DatabaseBackup className="h-7 w-7 text-indigo-600" />
            Sauvegardes
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Quels comptes sont protégés d&apos;un changement de téléphone
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Actualiser"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
      </div>

      {/* Le chiffre qui compte, dit sans détour. Une couverture faible n'est pas
          une statistique : c'est le nombre de personnes qui perdront leur
          historique au prochain téléphone. */}
      {alerte && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>{vue!.jamais}</strong> compte{vue!.jamais > 1 ? "s" : ""} sur{" "}
            {vue!.comptes} n&apos;{vue!.jamais > 1 ? "ont" : "a"} jamais sauvegardé.
            Ces personnes perdront tout leur historique en changeant de téléphone —
            et rien ne le leur dit.
          </span>
        </div>
      )}

      {vue && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tuile
            label="Couverture"
            valeur={`${vue.couverture} %`}
            hint={`sauvegarde de moins de ${vue.staleDays} jours`}
            accent={vue.couverture < 50}
          />
          <Tuile label="À jour" valeur={String(vue.recentes)} hint={`sur ${vue.comptes} comptes`} />
          <Tuile label="Périmées" valeur={String(vue.perimees)} accent={vue.perimees > 0} />
          <Tuile label="Jamais" valeur={String(vue.jamais)} accent={vue.jamais > 0} />
        </div>
      )}

      {/* Après une rotation de secret, cette liste dit combien de comptes portent
          encore l'ancienne version — donc combien de sauvegardes deviendraient
          illisibles si on la retirait trop tôt. */}
      {cles && cles.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Versions de clé en service</CardTitle>
            <CardDescription>
              Retirer une version rend illisibles les sauvegardes qui la portent.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {cles.map((k) => (
              <div
                key={k.kid}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <span className="font-mono text-xs text-zinc-500">clé v{k.kid}</span>
                <p className="font-semibold tabular-nums">
                  {k.comptes} compte{k.comptes > 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">{LIBELLES[filtre]}</CardTitle>
              <CardDescription>
                Le serveur ne détient pas les archives : il n&apos;affiche que ce que
                chaque appareil lui a déclaré.
              </CardDescription>
            </div>
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(Object.keys(LIBELLES) as Filtre[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltre(f)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    filtre === f
                      ? "bg-white font-medium shadow-sm dark:bg-zinc-950"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                  )}
                >
                  {LIBELLES[f]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte</TableHead>
                  <TableHead>Dernière sauvegarde</TableHead>
                  <TableHead className="text-right">Taille</TableHead>
                  <TableHead className="text-right">Messages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <UsersTableRowsSkeleton count={6} />}

                {!isLoading && comptes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-sm text-zinc-500">
                      Aucun compte dans cette catégorie.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  comptes.map((u) => (
                    <TableRow key={u.alanyaID}>
                      <TableCell className="text-sm">
                        <button
                          type="button"
                          onClick={() => router.push(`/users/${u.alanyaID}`)}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {u.nom || `#${u.alanyaID}`}
                        </button>
                        <span className="ml-2 text-xs text-zinc-400">{u.alanyaPhone}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.backupLastAt ? (
                          <span className="tabular-nums">
                            {new Date(u.backupLastAt).toLocaleDateString("fr-FR")}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">jamais</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-zinc-500">
                        {u.backupBytes ? formatOctets(u.backupBytes) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-zinc-500">
                        {u.backupMessageCount ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Tuile({
  label,
  valeur,
  hint,
  accent,
}: {
  label: string;
  valeur: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
        <p
          className={cn(
            "mt-1 text-2xl font-bold tabular-nums",
            accent && "text-amber-600 dark:text-amber-400",
          )}
        >
          {valeur}
        </p>
        {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function formatOctets(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}
