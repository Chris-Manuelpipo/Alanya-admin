"use client";

import { useState } from "react";
import { Languages, ScanText, Sparkles } from "lucide-react";
import type { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAiEditorialAvailable, useReviewContent, useTranslateContent } from "@/hooks/useAiEditorial";
import {
  CONTENT_LOCALES,
  CONTENT_LOCALE_LABELS,
  type ContentLocale,
  type Translations,
} from "@/lib/content-locales";
import { cn } from "@/lib/utils";
import type { AiContentKind, AiFinding } from "@/types";

/**
 * Barre d'assistance éditoriale — traduire, puis relire.
 *
 * Elle ne publie rien et n'enregistre rien : elle remplit des champs que
 * l'administrateur relit. C'est la même règle que côté serveur, et c'est ce qui
 * permet de la poser sur n'importe quel éditeur multilingue du panneau.
 *
 * Elle disparaît entièrement quand l'assistance n'est pas disponible — pas de
 * bouton grisé, pas d'explication : l'éditeur redevient exactement celui d'avant.
 */

const SEVERITY_STYLE: Record<AiFinding["severity"], string> = {
  bloquant: "text-red-600 dark:text-red-400",
  attention: "text-amber-600 dark:text-amber-500",
  suggestion: "text-zinc-500 dark:text-zinc-400",
};

/** Message d'erreur du serveur, ou à défaut celui de la couche transport. */
function errorMessage(e: unknown): string {
  const axiosError = e as AxiosError<{ error?: string }>;
  return axiosError?.response?.data?.error || (e as Error)?.message || "Erreur inconnue";
}

interface EditorialAssistProps {
  /** Contenu courant, toutes langues confondues. */
  translations: Translations;
  /** Nature du contenu — décide du ton et de la longueur attendus. */
  kind: AiContentKind;
  /**
   * Applique le résultat. Reçoit les seules langues produites, à fusionner
   * dans l'état existant : ce qui n'a pas été traduit ne doit pas être effacé.
   */
  onApply: (translations: Translations) => void;
  /** Langue de rédaction. Le français, sauf cas particulier. */
  sourceLocale?: ContentLocale;
  disabled?: boolean;
  /**
   * Proposer la relecture. Sans objet sur un libellé de bouton de trois mots,
   * où le coup d'œil suffit.
   */
  showReview?: boolean;
  className?: string;
}

export function EditorialAssist({
  translations,
  kind,
  onApply,
  sourceLocale = "fr",
  disabled,
  showReview = true,
  className,
}: EditorialAssistProps) {
  const available = useAiEditorialAvailable();
  const { addToast } = useToast();
  const translate = useTranslateContent();
  const review = useReviewContent();

  const [notes, setNotes] = useState<string[]>([]);
  const [findings, setFindings] = useState<AiFinding[] | null>(null);

  const source = translations[sourceLocale]?.trim() ?? "";

  // Ce qui reste à produire. Traduire ne touche qu'aux langues vides : une
  // traduction saisie à la main ne doit pas disparaître parce qu'on a cliqué
  // sur un bouton dont ce n'était pas la promesse.
  const empty = CONTENT_LOCALES.filter(
    (l) => l !== sourceLocale && !translations[l]?.trim(),
  );
  const targets = empty.length > 0 ? empty : CONTENT_LOCALES.filter((l) => l !== sourceLocale);
  const retranslating = empty.length === 0;

  const filledCount = CONTENT_LOCALES.filter((l) => translations[l]?.trim()).length;
  const busy = translate.isPending || review.isPending || disabled;

  if (!available) return null;

  function runTranslate() {
    setNotes([]);
    setFindings(null);
    translate.mutate(
      { content: source, kind, sourceLocale, targets },
      {
        onSuccess: (result) => {
          onApply(result.translations);
          setNotes(result.notes);

          const produites = Object.keys(result.translations) as ContentLocale[];
          if (produites.length === 0) {
            addToast({
              title: "Aucune traduction produite",
              description: "Le modèle n'a rien rendu d'exploitable. Réessayez.",
              variant: "error",
            });
            return;
          }
          addToast({
            title: `Traduit en ${produites.map((l) => CONTENT_LOCALE_LABELS[l]).join(", ")}`,
            description:
              result.missing.length > 0
                ? `Manque encore : ${result.missing.map((l) => CONTENT_LOCALE_LABELS[l]).join(", ")}`
                : "À relire avant publication.",
            variant: result.missing.length > 0 ? "default" : "success",
          });
        },
        onError: (e) =>
          addToast({ title: "Traduction impossible", description: errorMessage(e), variant: "error" }),
      },
    );
  }

  function runReview() {
    setNotes([]);
    review.mutate(
      { translations, kind },
      {
        onSuccess: (result) => {
          setFindings(result.findings);
          if (result.findings.length === 0) {
            addToast({ title: "Relecture : rien à signaler", variant: "success" });
          }
        },
        onError: (e) =>
          addToast({ title: "Relecture impossible", description: errorMessage(e), variant: "error" }),
      },
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Assistance
        </span>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !source}
          onClick={runTranslate}
          title={
            source
              ? undefined
              : `Écrivez d'abord le ${CONTENT_LOCALE_LABELS[sourceLocale].toLowerCase()}`
          }
        >
          <Languages className="mr-1.5 h-4 w-4" />
          {translate.isPending
            ? "Traduction…"
            : retranslating
              ? "Retraduire tout"
              : `Traduire en ${targets.map((l) => l.toUpperCase()).join(" + ")}`}
        </Button>

        {showReview && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || filledCount === 0}
            onClick={runReview}
          >
            <ScanText className="mr-1.5 h-4 w-4" />
            {review.isPending ? "Relecture…" : "Relire"}
          </Button>
        )}
      </div>

      {/* Le bouton écrase — autant le dire avant le clic, pas après. */}
      {retranslating && !busy && (
        <p className="text-xs text-zinc-500">
          Toutes les langues sont saisies : une nouvelle traduction remplacera ce qui
          s&apos;y trouve.
        </p>
      )}

      {notes.length > 0 && (
        <ul className="space-y-1">
          {notes.map((n, i) => (
            <li key={i} className="text-xs text-zinc-500">
              — {n}
            </li>
          ))}
        </ul>
      )}

      {findings != null && findings.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
          {findings.map((f, i) => (
            <li key={i} className={cn("text-xs", SEVERITY_STYLE[f.severity])}>
              <span className="font-medium">{CONTENT_LOCALE_LABELS[f.locale]}</span> — {f.message}
            </li>
          ))}
        </ul>
      )}

      {/* Une relecture propre disparaît au prochain clic ; l'ancien résultat
          resterait à l'écran comme s'il valait encore. */}
      {findings != null && findings.length === 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-500">
          Relecture : rien à signaler.
        </p>
      )}
    </div>
  );
}
