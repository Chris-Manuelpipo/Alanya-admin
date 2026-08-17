"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Radio, Save, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { PreviewContent } from "@/components/preview/PreviewStage";
import { StatusBackgroundPicker } from "@/components/preview/StatusBackgroundPicker";
import type { PreviewLang } from "@/components/preview/types";
import { useSaveWelcomeStatus, useWelcomeStatus } from "@/hooks/useWelcome";
import { cn } from "@/lib/utils";
import { WELCOME_STATUS_TEXT_MAX, type WelcomeStatusConfig } from "@/types";
import {
  CONTENT_LOCALES,
  CONTENT_LOCALE_LABELS,
  missingRequiredLocales,
  resolveTranslation,
} from "@/lib/content-locales";

const TYPES = [
  { value: 0, label: "Texte", icon: FileText },
  { value: 1, label: "Image", icon: ImageIcon },
  { value: 2, label: "Vidéo", icon: Video },
] as const;

const EMPTY: WelcomeStatusConfig = {
  enabled: false,
  type: 0,
  textFr: "",
  textEn: "",
  translations: {},
  mediaUrl: "",
  backgroundColor: "",
  updatedAt: null,
  updatedBy: null,
};

interface WelcomeStatusEditorProps {
  senderName?: string;
  senderAvatar?: string | null;
}

/**
 * Statut de bienvenue — réglage global, hors versionnement du message.
 *
 * Conséquence assumée sur l'interface : l'interrupteur enregistre tout de suite
 * (il doit faire ce qu'il dit), tandis que le contenu passe par un bouton
 * « Enregistrer ». Sans cette distinction, activer le statut publierait aussi
 * une rédaction en cours.
 */
export function WelcomeStatusEditor({ senderName, senderAvatar }: WelcomeStatusEditorProps) {
  const { data, isLoading } = useWelcomeStatus();
  const saveMutation = useSaveWelcomeStatus();
  const { addToast } = useToast();

  const [form, setForm] = useState<WelcomeStatusConfig>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [lang, setLang] = useState<PreviewLang>("fr");

  useEffect(() => {
    if (data) {
      setForm(data);
      setDirty(false);
    }
  }, [data]);

  function patch(next: Partial<WelcomeStatusConfig>) {
    setForm((f) => ({ ...f, ...next }));
    setDirty(true);
  }

  const translations = form.translations ?? {};
  const activeText = translations[lang] ?? "";
  const remaining = WELCOME_STATUS_TEXT_MAX - activeText.length;

  const contentError = useMemo(() => {
    const t = form.translations ?? {};
    if (form.type === 0 && !t.fr?.trim()) {
      return "Un statut texte exige un texte en français.";
    }
    // Le français et l'anglais sont exigés ; les autres langues retombent sur
    // l'anglais par la chaîne de repli, les exiger bloquerait la publication.
    const missing = t.fr?.trim() ? missingRequiredLocales(t) : [];
    if (missing.length > 0) {
      return `Traduction obligatoire manquante : ${missing
        .map((l) => CONTENT_LOCALE_LABELS[l])
        .join(", ")}.`;
    }
    if (form.type !== 0 && !form.mediaUrl.trim()) {
      return `Un statut ${form.type === 1 ? "image" : "vidéo"} exige un média.`;
    }
    const tooLong = CONTENT_LOCALES.find(
      (l) => (t[l] ?? "").length > WELCOME_STATUS_TEXT_MAX,
    );
    if (tooLong) {
      return `Texte limité à ${WELCOME_STATUS_TEXT_MAX} caractères (${CONTENT_LOCALE_LABELS[tooLong]}).`;
    }
    return null;
  }, [form]);

  const previewContent = useMemo<PreviewContent>(
    () => ({
      mode: "status",
      // Le statut porte les deux langues ; l'app choisit selon la locale du
      // téléphone, avec repli sur le français si l'anglais est vide.
      text: resolveTranslation(form.translations ?? {}, lang),
      type: form.type,
      mediaUrl: form.mediaUrl,
      backgroundColor: form.backgroundColor,
      senderName: senderName || "Alanya",
      senderAvatar,
    }),
    [form, lang, senderName, senderAvatar],
  );

  function save(next: Partial<WelcomeStatusConfig>, successTitle: string) {
    saveMutation.mutate(
      { ...form, ...next },
      {
        onSuccess: () => {
          setDirty(false);
          addToast({ title: successTitle, variant: "success" });
        },
        onError: (e: Error & { response?: { data?: { error?: string } } }) =>
          addToast({
            title: "Échec",
            description: e.response?.data?.error || e.message,
            variant: "error",
          }),
      },
    );
  }

  function toggleEnabled() {
    const next = !form.enabled;
    if (next && contentError) {
      addToast({ title: "Contenu incomplet", description: contentError, variant: "error" });
      return;
    }
    setForm((f) => ({ ...f, enabled: next }));
    save({ enabled: next }, next ? "Statut de bienvenue activé" : "Statut de bienvenue désactivé");
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex justify-center py-14">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-amber-500" />
              Statut de bienvenue
            </CardTitle>
            <CardDescription>
              Un statut de 24 h publié pour chaque nouvel inscrit, visible de lui seul
            </CardDescription>
          </div>

          <EnabledSwitch
            checked={form.enabled}
            pending={saveMutation.isPending}
            onChange={toggleEnabled}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Nature</Label>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = form.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => patch({ type: t.value })}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {form.type === 0
                    ? lang === "fr"
                      ? "Texte FR"
                      : "Texte EN"
                    : lang === "fr"
                      ? "Légende FR"
                      : "Légende EN"}
                </Label>
                <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                  {CONTENT_LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={cn(
                        "rounded-md px-2.5 py-0.5 text-xs font-medium uppercase transition-colors",
                        lang === l
                          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                          : "text-zinc-500",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={activeText}
                maxLength={WELCOME_STATUS_TEXT_MAX}
                rows={3}
                placeholder={lang === "fr" ? "Bienvenue sur Alanya !" : "Welcome to Alanya!"}
                onChange={(e) =>
                  patch({
                    translations: {
                      ...(form.translations ?? {}),
                      [lang]: e.target.value,
                    },
                  })
                }
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between text-xs">
                
                <span className={cn("tabular-nums", remaining < 20 ? "text-amber-600" : "text-zinc-400")}>
                  {remaining}
                </span>
              </div>
              {(form.translations?.fr ?? "").trim() &&
                missingRequiredLocales(form.translations ?? {}).length > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Traduction anglaise obligatoire.
                </p>
              )}
            </div>

            {form.type === 0 ? (
              <StatusBackgroundPicker
                value={form.backgroundColor}
                onChange={(backgroundColor) => patch({ backgroundColor })}
              />
            ) : (
              <div className="space-y-2">
                <Label>Média</Label>
                {form.mediaUrl ? (
                  <p className="truncate text-xs text-zinc-500">{form.mediaUrl}</p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Obligatoire pour un statut {form.type === 1 ? "image" : "vidéo"}.
                  </p>
                )}
                <FileUpload
                  accept={form.type === 1 ? "image/*" : "video/*"}
                  maxSize={50 * 1024 * 1024}
                  onUploadComplete={(url) => patch({ mediaUrl: url })}
                />
              </div>
            )}

            {contentError && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400">
                {contentError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button
                onClick={() => save({}, "Statut enregistré")}
                disabled={!dirty || !!contentError || saveMutation.isPending}
                variant="outline"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                Enregistrer le statut
              </Button>
              {dirty && (
                <span className="text-xs text-amber-600 dark:text-amber-500">
                  Modifications non enregistrées
                </span>
              )}
              <span className="ml-auto text-xs text-zinc-400">
                Prend effet immédiatement, sans publication
              </span>
            </div>
          </div>

          <div className="self-start xl:sticky xl:top-6">
            <PreviewPanel
              content={previewContent}
              lang={lang}
              onLangChange={setLang}
              modalTitle="Statut de bienvenue"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EnabledSwitch({
  checked,
  pending,
  onChange,
}: {
  checked: boolean;
  pending: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "text-sm font-medium",
          checked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500",
        )}
      >
        {checked ? "Actif" : "Inactif"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Activer le statut de bienvenue"
        disabled={pending}
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
          checked ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
