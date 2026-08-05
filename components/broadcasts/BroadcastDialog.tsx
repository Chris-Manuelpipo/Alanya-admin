"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BroadcastPreview } from "./BroadcastPreview";
import { CriteriaBuilder, draftToCriteria, type DraftCondition } from "./CriteriaBuilder";
import { RecipientEstimate, useRecipientEstimate } from "./RecipientEstimate";
import { useCreateBroadcast, useBroadcasts, useOfficialSenders } from "@/hooks/useBroadcasts";
import { useToast } from "@/components/ui/toast";
import { Megaphone, Loader2, FileText, Image, Video, Radio, AlertTriangle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import type { BroadcastFormData } from "@/types";
import { formatCriteriaSummary } from "@/lib/criteria-labels";
import { useCountries } from "@/hooks/useCountries";
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/mock-data";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contentTypes = [
  { value: 0, label: "Message", icon: FileText, isStatus: false },
  { value: 1, label: "Image", icon: Image, isStatus: false },
  { value: 2, label: "Vidéo", icon: Video, isStatus: false },
  { value: 3, label: "Statut (24 h)", icon: Radio, isStatus: true },
];

function newClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `bc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function BroadcastDialog({ open, onOpenChange }: BroadcastDialogProps) {
  const { addToast } = useToast();
  const createMutation = useCreateBroadcast();
  const { refetch } = useBroadcasts();
  const { data: senders, isLoading: sendersLoading } = useOfficialSenders();
  const { data: countries } = useCountries();
  const { data: stats } = useQuery({
    queryKey: ["admin-stats-broadcast"],
    queryFn: () => fetchStats(),
    staleTime: 60_000,
  });

  const [clientId, setClientId] = useState(newClientId);
  const [content, setContent] = useState("");
  const [type, setType] = useState(0);
  const [mediaUrl, setMediaUrl] = useState("");
  const [senderId, setSenderId] = useState<number | "">("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [criteriaDrafts, setCriteriaDrafts] = useState<DraftCondition[]>([]);
  const [confirmStep, setConfirmStep] = useState(false);
  const [estimateMismatch, setEstimateMismatch] = useState<number | null>(null);

  const isStatut = type === 3;
  const criteria = useMemo(() => draftToCriteria(criteriaDrafts), [criteriaDrafts]);
  const { count: estimatedCount, loading: estimateLoading } = useRecipientEstimate(criteria);

  useEffect(() => {
    if (open) {
      setClientId(newClientId());
      setConfirmStep(false);
      setEstimateMismatch(null);
    }
  }, [open]);

  useEffect(() => {
    if (senders?.length && senderId === "") {
      setSenderId(senders[0].alanyaID);
    }
  }, [senders, senderId]);

  const criteriaSummary = formatCriteriaSummary(criteria, {
    countryName: (id) => countries?.find((c) => c.idPays === id)?.libelle,
  });

  const canSend =
    content.trim().length > 0 &&
    senderId !== "" &&
    !createMutation.isPending &&
    !estimateLoading &&
    estimatedCount != null;

  function resetForm() {
    setContent("");
    setType(0);
    setMediaUrl("");
    setScheduledAt("");
    setCriteriaDrafts([]);
    setConfirmStep(false);
    setEstimateMismatch(null);
    setClientId(newClientId());
    if (senders?.length) setSenderId(senders[0].alanyaID);
    else setSenderId("");
  }

  function handleSendClick() {
    if (!canSend) return;
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }
    submitBroadcast();
  }

  function submitBroadcast(confirmedCount?: number) {
    if (!canSend && confirmedCount == null) return;

    const data: BroadcastFormData = {
      senderId: Number(senderId),
      content: content.trim(),
      type: isStatut ? 0 : type,
      mediaUrl: mediaUrl || undefined,
      criteria,
      clientId,
      isStatus: isStatut,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      confirmedEstimate: confirmedCount ?? estimatedCount ?? undefined,
    };

    createMutation.mutate(data, {
      onSuccess: (result) => {
        const scheduled = result && "scheduled" in result && result.scheduled;
        addToast({
          title: scheduled ? "Diffusion programmée" : isStatut ? "Statut publié" : "Diffusion lancée",
          description: scheduled
            ? `Envoi prévu le ${new Date(result.scheduledAt).toLocaleString("fr-FR")}.`
            : isStatut
              ? "Votre statut a été publié."
              : "La diffusion est en cours de traitement.",
          variant: "success",
        });
        resetForm();
        onOpenChange(false);
        refetch();
      },
      onError: (err: unknown) => {
        const resp = err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number; data?: { error?: string; count?: number } } }).response
          : undefined;
        if (resp?.status === 409 && resp.data?.count != null) {
          setEstimateMismatch(resp.data.count);
          addToast({
            title: "Estimation modifiée",
            description: `Nouveau total : ${resp.data.count.toLocaleString("fr-FR")} destinataires. Confirmez à nouveau.`,
            variant: "error",
          });
          return;
        }
        addToast({
          title: "Erreur",
          description: resp?.data?.error || "Échec de l'envoi.",
          variant: "error",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            {isStatut ? "Nouveau statut" : "Composer une diffusion"}
          </DialogTitle>
          <DialogDescription>
            Le contenu à gauche, le ciblage à droite. L&apos;estimation se recalcule à chaque changement.
          </DialogDescription>
        </DialogHeader>

        {confirmStep ? (
          <div className="py-4 space-y-4">
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-4 space-y-3">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Confirmer l&apos;envoi</p>
                  <p className="text-sm mt-1 text-amber-700/90 dark:text-amber-300/90">
                    Vous allez diffuser à{" "}
                    <strong className="font-mono tabular-nums">
                      {(estimateMismatch ?? estimatedCount)?.toLocaleString("fr-FR")}
                    </strong>{" "}
                    destinataires ({criteriaSummary}).
                  </p>
                </div>
              </div>
              {estimateMismatch != null && (
                <p className="text-xs text-amber-600">
                  L&apos;estimation a changé depuis votre dernière consultation.
                </p>
              )}
            </div>
            <BroadcastPreview
              content={content}
              type={isStatut ? 0 : type}
              mediaUrl={mediaUrl || undefined}
              criteriaSummary={criteriaSummary}
              isStatus={isStatut}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-6 py-2">
            {/* Colonne contenu */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Nature</label>
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  {contentTypes.map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setType(ct.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          type === ct.value
                            ? ct.isStatus
                              ? "bg-white dark:bg-zinc-900 shadow-sm text-amber-700 dark:text-amber-300"
                              : "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {ct.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Expéditeur</label>
                {sendersLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                ) : senders?.length ? (
                  <select
                    value={senderId}
                    onChange={(e) => setSenderId(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {senders.map((s) => (
                      <option key={s.alanyaID} value={s.alanyaID}>
                        {s.nom} (@{s.pseudo})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-red-500">Aucun compte officiel disponible.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {isStatut ? "Contenu du statut" : "Contenu"}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={isStatut ? "Votre statut…" : "Votre message…"}
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {(type === 1 || type === 2 || isStatut) && (
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {isStatut ? "Média (optionnel)" : "Média"}
                  </label>
                  <FileUpload
                    accept={type === 2 ? "video/*" : "image/*,video/*"}
                    maxSize={50 * 1024 * 1024}
                    onUploadComplete={(url) => setMediaUrl(url)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Planification (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            {/* Colonne ciblage */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Ciblage</label>
                <CriteriaBuilder drafts={criteriaDrafts} onChange={setCriteriaDrafts} />
              </div>

              <RecipientEstimate count={estimatedCount} loading={estimateLoading} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {confirmStep ? (
            <>
              <Button variant="outline" onClick={() => { setConfirmStep(false); setEstimateMismatch(null); }}>
                Retour
              </Button>
              <Button
                onClick={() => submitBroadcast(estimateMismatch ?? estimatedCount ?? undefined)}
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Confirmer et {scheduledAt ? "programmer" : "diffuser"}</>
                )}
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button
                onClick={handleSendClick}
                disabled={!canSend}
                className={
                  isStatut
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
                }
              >
                {estimateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isStatut ? <Radio className="h-4 w-4 mr-1.5" /> : <Megaphone className="h-4 w-4 mr-1.5" />}
                    {scheduledAt ? "Programmer" : "Diffuser maintenant"}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
