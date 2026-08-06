"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PreviewModal } from "./PreviewModal";
import { fitScale, PreviewStage, type PreviewContent } from "./PreviewStage";
import { AppThemeToggle, LangToggle } from "./PreviewToolbar";
import type { AppTheme, PreviewLang } from "./types";

interface PreviewPanelProps {
  content: PreviewContent;
  lang: PreviewLang;
  onLangChange: (l: PreviewLang) => void;
  /** Marge verticale réservée au chrome de la page pour le calcul d'échelle. */
  reservedHeight?: number;
  modalTitle?: string;
  className?: string;
}

/**
 * Colonne d'aperçu collante : barre d'outils, téléphone à l'échelle, bouton 👁.
 *
 * L'échelle est recalculée depuis la largeur réellement disponible plutôt que
 * fixée en dur : le téléphone remplit la colonne sur un grand écran et se réduit
 * proprement sur un portable, sans qu'aucune cote interne ne change.
 */
export function PreviewPanel({
  content,
  lang,
  onLangChange,
  reservedHeight = 260,
  modalTitle,
  className,
}: PreviewPanelProps) {
  const [theme, setTheme] = useState<AppTheme>("light");
  const [modalOpen, setModalOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLButtonElement>(null);
  const scale = useFitScale(stageRef, reservedHeight);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <LangToggle value={lang} onChange={onLangChange} />
        <AppThemeToggle value={theme} onChange={setTheme} compact />
        <Button
          ref={eyeRef}
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          onClick={() => setModalOpen(true)}
        >
          <Eye className="h-4 w-4" />
          Plein écran
        </Button>
      </div>

      <div ref={stageRef} className="flex justify-center">
        {scale > 0 ? (
          <PreviewStage content={content} theme={theme} lang={lang} scale={scale} />
        ) : (
          // Premier rendu : on n'a pas encore mesuré la colonne.
          <div className="h-[520px] w-full" />
        )}
      </div>

      <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Rendu à l&apos;échelle du mobile — {content.mode === "status" ? "statut 24 h" : "conversation officielle"}
      </p>

      <PreviewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        content={content}
        theme={theme}
        onThemeChange={setTheme}
        lang={lang}
        onLangChange={onLangChange}
        title={modalTitle}
        returnFocusTo={eyeRef}
      />
    </div>
  );
}

/** Échelle tenant dans la largeur mesurée et dans la hauteur de la fenêtre. */
function useFitScale(ref: React.RefObject<HTMLElement | null>, reservedHeight: number) {
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      const available = Math.max(320, window.innerHeight - reservedHeight);
      setScale(Math.min(1, Math.max(0.4, fitScale(width, available))));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, reservedHeight]);

  return scale;
}

/** Bouton 👁 autonome — pour l'historique, où il n'y a pas de colonne d'aperçu. */
export function PreviewEyeButton({
  content,
  defaultLang = "fr",
  label = "Aperçu",
  title,
  className,
}: {
  content: PreviewContent | ((lang: PreviewLang) => PreviewContent);
  defaultLang?: PreviewLang;
  label?: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<PreviewLang>(defaultLang);
  const [theme, setTheme] = useState<AppTheme>("light");
  const eyeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setLang(defaultLang), [defaultLang]);

  const resolved = typeof content === "function" ? content(lang) : content;

  return (
    <>
      <Button
        ref={eyeRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        title={label}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <PreviewModal
        open={open}
        onOpenChange={setOpen}
        content={resolved}
        theme={theme}
        onThemeChange={setTheme}
        lang={lang}
        onLangChange={setLang}
        title={title}
        returnFocusTo={eyeRef}
      />
    </>
  );
}
