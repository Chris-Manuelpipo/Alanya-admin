"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BroadcastPreview } from "./BroadcastPreview";
import { useCreateBroadcast, useBroadcasts } from "@/hooks/useBroadcasts";
import { useCountries } from "@/hooks/useCountries";
import { useToast } from "@/components/ui/toast";
import { Megaphone, Loader2, FileText, Image, Video, Radio } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import type { BroadcastFormData } from "@/types";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contentTypes = [
  { value: 0, label: "Texte", icon: FileText },
  { value: 1, label: "Image", icon: Image },
  { value: 2, label: "Vidéo", icon: Video },
  { value: 3, label: "Statut", icon: Radio },
];

const descriptions: Record<number, string> = {
  0: "Envoyez un message texte à tous les utilisateurs ou à un groupe ciblé.",
  1: "Envoyez une image à tous les utilisateurs ou à un groupe ciblé.",
  2: "Envoyez une vidéo à tous les utilisateurs ou à un groupe ciblé.",
  3: "Créez un statut visible par tous les utilisateurs ou un groupe ciblé.",
};

export function BroadcastDialog({ open, onOpenChange }: BroadcastDialogProps) {
  const { addToast } = useToast();
  const createMutation = useCreateBroadcast();
  const { refetch } = useBroadcasts();
  const { data: countries } = useCountries();

  const [content, setContent] = useState("");
  const [type, setType] = useState(0);
  const [mediaUrl, setMediaUrl] = useState("");
  const [targetType, setTargetType] = useState<"all" | "country" | "specific">("all");
  const [targetPays, setTargetPays] = useState("");

  const isStatut = type === 3;
  const canSend = content.trim().length > 0 && !createMutation.isPending;

  function handleSend() {
    if (!canSend) return;

    const data: BroadcastFormData = {
      content: content.trim(),
      type: isStatut ? 0 : type,
      mediaUrl: mediaUrl || undefined,
      targetType: isStatut ? "all" : targetType,
      targetCriteria: !isStatut && targetType === "country" && targetPays ? { idPays: parseInt(targetPays) } : {},
      isStatus: isStatut,
    };

    createMutation.mutate(data, {
      onSuccess: () => {
        addToast({
          title: isStatut ? "Statut publié" : "Broadcast envoyé",
          description: isStatut
            ? "Votre statut a été publié avec succès."
            : "Votre message a été diffusionné avec succès.",
          variant: "success",
        });
        resetForm();
        onOpenChange(false);
        refetch();
      },
      onError: () => {
        addToast({ title: "Erreur", description: "Échec de l'envoi.", variant: "error" });
      },
    });
  }

  function resetForm() {
    setContent("");
    setType(0);
    setMediaUrl("");
    setTargetType("all");
    setTargetPays("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            {isStatut ? "Nouveau statut" : "Nouveau broadcast"}
          </DialogTitle>
          <DialogDescription>{descriptions[type]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Content type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2 flex-wrap">
              {contentTypes.map((ct) => {
                const Icon = ct.icon;
                return (
                  <button
                    key={ct.value}
                    onClick={() => setType(ct.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      type === ct.value
                        ? ct.value === 3
                          ? "bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                          : "bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {ct.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isStatut ? "Contenu du statut" : "Message"}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isStatut ? "Votre statut…" : "Votre message aux utilisateurs…"}
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
          </div>

          {/* Media upload (image/video/statut with media) */}
          {(type === 1 || type === 2 || isStatut) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isStatut ? "Média (optionnel)" : "Média"}
              </label>
              <FileUpload
                accept={type === 2 ? "video/*" : "image/*,video/*"}
                maxSize={50 * 1024 * 1024}
                onUploadComplete={(url) => setMediaUrl(url)}
              />
            </div>
          )}

          {/* Targeting — only for non-statut */}
          {!isStatut && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Ciblage</label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "Tous les utilisateurs" },
                  { value: "country", label: "Par pays" },
                  { value: "specific", label: "Utilisateurs spécifiques" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      targetType === opt.value
                        ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      value={opt.value}
                      checked={targetType === opt.value}
                      onChange={(e) => setTargetType(e.target.value as typeof targetType)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {targetType === "country" && countries && (
                <select
                  value={targetPays}
                  onChange={(e) => setTargetPays(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map((c: { idPays: number; libelle: string }) => (
                    <option key={c.idPays} value={c.idPays}>{c.libelle}</option>
                  ))}
                </select>
              )}

              {targetType === "specific" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                  La sélection d&apos;utilisateurs spécifiques sera disponible prochainement.
                </p>
              )}
            </div>
          )}

          {/* Visibility — only for statut */}
          {isStatut && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Visible par</label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "Tous les utilisateurs" },
                  { value: "country", label: "Par pays" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      targetType === opt.value
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={targetType === opt.value}
                      onChange={(e) => setTargetType(e.target.value as "all" | "country")}
                      className="accent-amber-600"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {targetType === "country" && countries && (
                <select
                  value={targetPays}
                  onChange={(e) => setTargetPays(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map((c: { idPays: number; libelle: string }) => (
                    <option key={c.idPays} value={c.idPays}>{c.libelle}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Preview */}
          {content.trim() && (
            <BroadcastPreview
              content={content}
              type={isStatut ? 0 : type}
              mediaUrl={mediaUrl || undefined}
              targetType={targetType}
              isStatus={isStatut}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className={
              isStatut
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
            }
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isStatut ? <Radio className="h-4 w-4 mr-1.5" /> : <Megaphone className="h-4 w-4 mr-1.5" />}
                {isStatut ? "Publier" : "Diffuser"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
