"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useId, useRef } from "react";
import { PreviewStage, type PreviewContent } from "./PreviewStage";
import { AppThemeToggle, LangToggle } from "./PreviewToolbar";
import type { AppTheme, PreviewLang } from "./types";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: PreviewContent;
  theme: AppTheme;
  onThemeChange: (t: AppTheme) => void;
  lang: PreviewLang;
  onLangChange: (l: PreviewLang) => void;
  title?: string;
  /** Élément à re-focaliser à la fermeture — le bouton 👁 qui a ouvert le modal. */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}

/**
 * Aperçu grandeur nature — le téléphone à l'échelle 1.
 *
 * Le `Dialog` maison ne gère ni `aria-labelledby` ni le retour de focus ; on les
 * ajoute ici plutôt que de modifier une primitive utilisée par sept écrans.
 */
export function PreviewModal({
  open,
  onOpenChange,
  content,
  theme,
  onThemeChange,
  lang,
  onLangChange,
  title = "Aperçu sur mobile",
  returnFocusTo,
}: PreviewModalProps) {
  const titleId = useId();
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      returnFocusTo?.current?.focus();
    }
  }, [open, returnFocusTo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby={titleId}
        className="max-w-[520px] overflow-y-auto p-0 sm:max-h-[92vh]"
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-zinc-200/80 bg-white/95 px-5 py-3 backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95">
          <h2 id={titleId} className="mr-auto text-sm font-semibold">
            {title}
            <span className="ml-2 font-normal text-zinc-500">
              {content.mode === "status" ? "· Statut 24 h" : "· Conversation"}
            </span>
          </h2>
          <LangToggle value={lang} onChange={onLangChange} />
          <AppThemeToggle value={theme} onChange={onThemeChange} className="mr-8" />
        </div>

        <div className="flex justify-center bg-zinc-100 px-5 py-6 dark:bg-zinc-950">
          <PreviewStage content={content} theme={theme} lang={lang} scale={1} className="preview-rise" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
