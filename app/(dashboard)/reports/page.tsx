"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, MessageSquare, RefreshCw, ShieldQuestion, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { FeedListSkeleton } from "@/components/skeletons";
import { useHandleReport, useReportActions, useReports } from "@/hooks/useReports";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import type { Report, ReportState } from "@/types";

/** Libellés alignés sur ceux de l'application — mêmes clés, même vocabulaire. */
const REASONS: Record<string, string> = {
  harassment: "Harcèlement ou intimidation",
  hate: "Propos haineux",
  violence: "Violence ou menaces",
  sexual: "Contenu sexuel",
  scam: "Arnaque ou fraude",
  spam: "Spam",
  impersonation: "Usurpation d'identité",
  other: "Autre",
};

const STATES: { value: ReportState | ""; label: string }[] = [
  { value: "open", label: "À traiter" },
  { value: "reviewing", label: "En cours" },
  { value: "actioned", label: "Sanctionnés" },
  { value: "dismissed", label: "Classés" },
  { value: "", label: "Tous" },
];

const STATE_STYLE: Record<ReportState, string> = {
  open: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  reviewing: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  actioned: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  dismissed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

const STATE_LABEL: Record<ReportState, string> = {
  open: "À traiter",
  reviewing: "En cours",
  actioned: "Sanctionné",
  dismissed: "Classé",
};

function age(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return "il y a moins d'une heure";
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export default function ReportsPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const { addToast } = useToast();

  const [state, setState] = useState<ReportState | "">("open");
  const [decision, setDecision] = useState<{ report: Report; action: string } | null>(null);
  const [note, setNote] = useState("");

  const { data: reports, isLoading, isFetching, refetch } = useReports(state || undefined);
  const handle = useHandleReport();

  const canHandle = can("reports.handle");

  function decide() {
    if (!decision) return;
    handle.mutate(
      { id: decision.report.id, action: decision.action, note: note.trim() || undefined },
      {
        onSuccess: () => {
          addToast({ title: "Décision enregistrée", variant: "success" });
          setDecision(null);
          setNote("");
        },
        onError: (e: Error) =>
          addToast({ title: "Échec", description: e.message, variant: "error" }),
      },
    );
  }

  const rows = reports ?? [];
  const open = rows.filter((r) => r.state === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Flag className="h-7 w-7 text-indigo-600" />
            Signalements
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Les plus anciens d&apos;abord — une file se vide par le bas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {STATES.map((s) => (
              <button
                key={s.value || "tous"}
                type="button"
                onClick={() => setState(s.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  state === s.value
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0"
            aria-label="Actualiser"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {open > 0 && state !== "open" && (
        <button
          type="button"
          onClick={() => setState("open")}
          className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
        >
          <strong>{open}</strong> signalement{open > 1 ? "s" : ""} en attente de traitement
        </button>
      )}

      {isLoading && <FeedListSkeleton count={4} />}

      {!isLoading && rows.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <ShieldQuestion className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Aucun signalement
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {state === "open"
                ? "Rien n'attend de décision."
                : "Aucun signalement dans cet état."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <Card key={r.id} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {r.targetType === "message" ? (
                      <MessageSquare className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <UserX className="h-4 w-4 text-zinc-400" />
                    )}
                    {REASONS[r.reason] ?? r.reason}
                  </CardTitle>
                  <CardDescription>
                    Signalé par {r.reporterNom ?? "un compte supprimé"} · {age(r.createdAt)}
                    {r.actions > 0 ? ` · ${r.actions} décision${r.actions > 1 ? "s" : ""}` : ""}
                  </CardDescription>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    STATE_STYLE[r.state],
                  )}
                >
                  {STATE_LABEL[r.state]}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {r.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-400">Précision :</span> {r.note}
                </p>
              )}

              {/* Le message signalé, servi ici et nulle part ailleurs dans le
                  panneau : signaler, c'est demander qu'il soit lu. La
                  conversation autour n'est jamais montrée. */}
              {r.targetType === "message" && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  {r.targetMsgId == null ? (
                    <p className="text-sm italic text-zinc-400">
                      Message supprimé depuis — le signalement lui survit.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500">
                        {r.msgSenderNom ?? "auteur inconnu"}
                        {r.msgSentAt
                          ? ` · ${new Date(r.msgSentAt).toLocaleString("fr-FR")}`
                          : ""}
                        {r.msgDeleted ? " · supprimé par son auteur" : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {r.msgContent || (
                          <span className="italic text-zinc-400">
                            {r.msgType === 0 ? "message vide" : "contenu non textuel"}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                {(r.targetUserId ?? r.msgSenderId) != null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/users/${r.targetUserId ?? r.msgSenderId}`)}
                  >
                    Voir le compte visé
                    {r.targetExclus ? " (banni)" : ""}
                  </Button>
                )}

                {canHandle && r.state !== "actioned" && r.state !== "dismissed" && (
                  <>
                    {r.state === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDecision({ report: r, action: "reviewing" })}
                      >
                        Prendre en charge
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDecision({ report: r, action: "actioned" })}
                    >
                      Sanction appliquée
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDecision({ report: r, action: "dismissed" })}
                    >
                      Classer sans suite
                    </Button>
                  </>
                )}

                <ActionHistory reportId={r.id} count={r.actions} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bannir ne se fait pas ici : le bouton vit sur la fiche du compte, où le
          garde `users.ban` s'applique et où l'action est déjà journalisée. Un
          second chemin se serait désynchronisé du premier. */}
      <ConfirmDialog
        open={decision != null}
        onOpenChange={(o) => {
          if (!o) {
            setDecision(null);
            setNote("");
          }
        }}
        title={
          decision?.action === "dismissed"
            ? "Classer sans suite ?"
            : decision?.action === "reviewing"
              ? "Prendre en charge ?"
              : "Enregistrer la sanction ?"
        }
        description="La décision est enregistrée avec votre nom et reste consultable dans l'historique du signalement."
        confirmLabel="Enregistrer"
        pending={handle.isPending}
        onConfirm={decide}
      >
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (facultative) — ce que vous avez constaté"
          maxLength={500}
        />
      </ConfirmDialog>
    </div>
  );
}

/** Historique des décisions, replié tant qu'on ne le demande pas. */
function ActionHistory({ reportId, count }: { reportId: number; count: number }) {
  const [open, setOpen] = useState(false);
  const { data } = useReportActions(open ? reportId : null);

  if (count === 0) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {open ? "Masquer l'historique" : `Historique (${count})`}
      </button>
      {open && data && (
        <div className="mt-2 space-y-1.5">
          {data.map((a) => (
            <p key={a.id} className="text-xs text-zinc-500">
              <span className="font-mono">{a.action}</span> · {a.adminNom ?? "compte supprimé"} ·{" "}
              {new Date(a.createdAt).toLocaleString("fr-FR")}
              {a.note ? ` — ${a.note}` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
