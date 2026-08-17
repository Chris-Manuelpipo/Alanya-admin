"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useBroadcasts, useCancelScheduledBroadcast } from "@/hooks/useBroadcasts";
import { BroadcastHistorySkeleton } from "@/components/skeletons";
import { BroadcastProgress, isActiveBroadcastStatus } from "./BroadcastProgress";
import { PreviewEyeButton } from "@/components/preview/PreviewPanel";
import type { PreviewContent } from "@/components/preview/PreviewStage";
import type { PreviewLang } from "@/components/preview/types";
import { broadcastToPreview } from "@/lib/preview/broadcast-to-preview";
import { formatCriteriaSummary } from "@/lib/criteria-labels";
import { useCountries } from "@/hooks/useCountries";
import {
  BroadcastFilters,
  hasActiveBroadcastFilters,
  type BroadcastFilterState,
} from "@/components/broadcasts/BroadcastFilters";
import { periodToRange } from "@/lib/period";
import { Megaphone, FileText, Image, Video, Radio, Calendar, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Broadcast, ScheduledBroadcast } from "@/types";

const mediaTypeIcons: Record<number, React.ElementType> = {
  0: FileText,
  1: Image,
  2: Video,
};

function formatOpenRate(b: Broadcast): string {
  if (b.deliveredCountRefreshedAt && b.estimate > 0) {
    const rate = Math.round((b.deliveredCount / b.estimate) * 100);
    return `${rate} %`;
  }
  if (b.openRate > 0) {
    return `${Math.round(b.openRate * 100)} %`;
  }
  if (isActiveBroadcastStatus(b.status)) return "—";
  return b.deliveredCountRefreshedAt ? "0 %" : "…";
}

/** Aperçu d'une diffusion déjà partie — le seul moyen de revoir ce qui a été envoyé. */
function previewOf(
  b: Pick<Broadcast, "kind" | "content" | "contentEn" | "type" | "mediaUrl" | "senderName">,
  lang: PreviewLang,
): PreviewContent {
  const result = broadcastToPreview(
    {
      kind: b.kind ?? 0,
      // Historique : les diffusions déjà publiées n'ont que les colonnes
      // héritées, la chaîne de repli fait le reste pour les autres langues.
      translations: { fr: b.content ?? undefined, en: b.contentEn ?? undefined },
      type: b.type,
      mediaUrl: b.mediaUrl,
    },
    lang,
  );
  const senderName = b.senderName || "Alanya";
  return result.mode === "status"
    ? { mode: "status", text: result.text, type: result.type, mediaUrl: result.mediaUrl, senderName }
    : { mode: "chat", messages: result.messages, senderName, official: true };
}

function BroadcastRow({
  b,
  countryName,
}: {
  b: Broadcast;
  countryName: (id: number) => string | undefined;
}) {
  const isStatus = b.kind === 1;
  const TypeIcon = isStatus ? Radio : mediaTypeIcons[b.type] || FileText;
  const criteriaLabel = formatCriteriaSummary(b.criteria, { countryName });
  const showProgress =
    b.pushJobsTotal > 0 ||
    isActiveBroadcastStatus(b.status) ||
    b.status === "completed" ||
    b.status === "partial_failed";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isStatus ? "bg-amber-100 dark:bg-amber-950/50" : "bg-indigo-100 dark:bg-indigo-950/50"
        }`}
      >
        <TypeIcon
          className={`h-4 w-4 ${isStatus ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"}`}
        />
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-1.5">
          <p className="line-clamp-2 text-sm text-zinc-900 dark:text-zinc-100">{b.content}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={`text-[10px] ${isStatus ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : ""}`}
            >
              {isStatus ? "Statut" : b.type === 0 ? "Message" : b.type === 1 ? "Image" : "Vidéo"}
            </Badge>
            {b.contentEn?.trim() ? (
              <Badge variant="outline" className="text-[10px]">
                EN
              </Badge>
            ) : null}
            <span
              className="max-w-[28ch] truncate font-mono text-[11px] text-zinc-500"
              title={criteriaLabel}
            >
              {criteriaLabel}
            </span>
            {b.senderName && <span className="text-[10px] text-zinc-400">via {b.senderName}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(b.sentAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}{" "}
              {new Date(b.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="font-mono tabular-nums">
              {(b.estimate ?? 0).toLocaleString("fr-FR")} dest.
            </span>
            <span
              className="font-mono tabular-nums"
              title={
                b.deliveredCountRefreshedAt
                  ? `Actualisé ${new Date(b.deliveredCountRefreshedAt).toLocaleString("fr-FR")}`
                  : undefined
              }
            >
              {formatOpenRate(b)} ouvertures
            </span>
            {b.deliveredCountRefreshedAt && (
              <span className="flex items-center gap-1 text-zinc-300 dark:text-zinc-600">
                <Clock className="h-3 w-3" />
                {new Date(b.deliveredCountRefreshedAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
        {showProgress && <BroadcastProgress broadcastId={b.id} compact />}
      </div>

      <PreviewEyeButton
        className="shrink-0"
        label="Voir le rendu sur mobile"
        title={isStatus ? "Statut officiel" : "Diffusion"}
        content={(lang) => previewOf(b, lang)}
      />
    </div>
  );
}

function ScheduledRow({ s }: { s: ScheduledBroadcast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelMutation = useCancelScheduledBroadcast();
  const { addToast } = useToast();

  // Le payload du job reprend les arguments passés à `publishBroadcast`.
  const payload = s.payload as {
    content?: string;
    contentEn?: string;
    kind?: number;
    type?: number;
    mediaUrl?: string;
  };

  const content = useMemo(
    () => (lang: PreviewLang) =>
      previewOf(
        {
          kind: payload.kind ?? 0,
          content: payload.content ?? "",
          contentEn: payload.contentEn ?? null,
          type: payload.type ?? 0,
          mediaUrl: payload.mediaUrl ?? null,
          senderName: undefined,
        },
        lang,
      ),
    [payload.kind, payload.content, payload.contentEn, payload.type, payload.mediaUrl],
  );

  function handleCancel() {
    cancelMutation.mutate(s.jobId, {
      onSuccess: () => {
        setConfirmOpen(false);
        addToast({ title: "Diffusion programmée annulée", variant: "success" });
      },
      onError: () => addToast({ title: "Échec de l'annulation", variant: "error" }),
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/30 p-3 dark:border-indigo-800 dark:bg-indigo-950/20">
      <Clock className="h-4 w-4 shrink-0 text-indigo-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{payload.content || "Diffusion programmée"}</p>
        <p className="text-[10px] text-zinc-400">{new Date(s.scheduledAt).toLocaleString("fr-FR")}</p>
      </div>
      <PreviewEyeButton
        className="shrink-0"
        label="Voir le rendu sur mobile"
        title="Diffusion programmée"
        content={content}
      />
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-red-500 hover:text-red-600"
        aria-label="Annuler la diffusion programmée"
        title="Annuler"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Annuler cette diffusion programmée ?"
        description={`L'envoi prévu le ${new Date(s.scheduledAt).toLocaleString("fr-FR")} sera supprimé de la file. Cette action est définitive.`}
        confirmLabel="Annuler l'envoi"
        cancelLabel="Conserver"
        variant="destructive"
        pending={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}

const PAGE_SIZE = 20;

const DEFAULT_FILTERS: BroadcastFilterState = {
  search: "",
  kind: "",
  type: "",
  status: "",
  idPays: "",
  period: "",
  dateFrom: "",
  dateTo: "",
  sort: "sent_at",
  order: "desc",
};

export function BroadcastHistory() {
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BroadcastFilterState>(DEFAULT_FILTERS);

  const dateRange = useMemo(() => {
    if (filters.period) return periodToRange(filters.period);
    if (filters.dateFrom || filters.dateTo) {
      return { from: filters.dateFrom, to: filters.dateTo };
    }
    return { from: undefined, to: undefined };
  }, [filters.period, filters.dateFrom, filters.dateTo]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: filters.search || undefined,
      kind: filters.kind || undefined,
      type: filters.type || undefined,
      status: filters.status || undefined,
      idPays: filters.idPays || undefined,
      from: dateRange.from,
      to: dateRange.to,
      sort: filters.sort !== "sent_at" ? filters.sort : undefined,
      order: filters.order !== "desc" ? filters.order : undefined,
    }),
    [page, filters, dateRange],
  );

  const { data, isLoading, isFetching } = useBroadcasts(queryParams);
  const { data: countries } = useCountries();

  const countryName = (id: number) => countries?.find((c) => c.idPays === id)?.libelle;
  const hasFilters = hasActiveBroadcastFilters(filters);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  function handleSearch(value: string) {
    setFilters((prev) => ({ ...prev, search: value }));
    setPage(1);
  }

  function handleFilterChange<K extends keyof BroadcastFilterState>(key: K, value: BroadcastFilterState[K]) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "period") {
        if (value) {
          const range = periodToRange(String(value));
          next.dateFrom = range.from;
          next.dateTo = range.to;
        } else {
          next.dateFrom = "";
          next.dateTo = "";
        }
      }
      if ((key === "dateFrom" || key === "dateTo") && value) {
        next.period = "";
      }
      return next;
    });
    setPage(1);
  }

  const broadcasts = data?.items || [];
  const scheduled = page === 1 && !hasFilters ? data?.scheduled || [] : [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showPagination = total > PAGE_SIZE;

  return (
    <div className="space-y-4">
      <BroadcastFilters
        filters={filters}
        countries={countries}
        isFetching={isFetching}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {isLoading ? (
        <BroadcastHistorySkeleton />
      ) : broadcasts.length === 0 && scheduled.length === 0 ? (
        <Card className="border-0 bg-white shadow-sm dark:bg-zinc-900">
          <CardContent className="p-12 text-center">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {hasFilters ? "Aucune diffusion ne correspond aux filtres" : "Aucune diffusion envoyée"}
            </p>
            {hasFilters && (
              <p className="mt-1 text-xs text-zinc-400">Essayez d&apos;élargir ou de réinitialiser les filtres</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 bg-white shadow-sm dark:bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Historique ({total.toLocaleString("fr-FR")})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduled.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Programmées</p>
                  {scheduled.map((s) => (
                    <ScheduledRow key={s.jobId} s={s} />
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {broadcasts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Aucune diffusion sur cette page
                  </p>
                ) : (
                  broadcasts.map((b) => (
                    <BroadcastRow key={b.id} b={b} countryName={countryName} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {showPagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {page} sur {totalPages} ({total.toLocaleString("fr-FR")} résultats)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
