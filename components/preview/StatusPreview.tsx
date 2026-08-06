"use client";

import { Heart, Play, X } from "lucide-react";

/**
 * Rendu du statut 24 h — status_viewer_screen.dart.
 *
 * Deux points qui surprennent et qu'il ne faut pas « corriger » :
 *
 * 1. `publishBroadcast` insère la ligne `statut` **sans** `backgroundColor`
 *    (broadcastService.js:129-134). Le viewer retombe donc systématiquement sur
 *    `AppColors.brandPrimary` (:843), soit #3F51B5.
 * 2. Le Scaffold du viewer est en `AppColors.black` (:545) quel que soit le
 *    thème. Un statut a donc **le même rendu en clair et en sombre** — d'où les
 *    couleurs codées en dur ici plutôt que des jetons `--app-*`.
 */

/** Repli de `_parseColor(...) ?? AppColors.brandPrimary` (viewer, ligne 843). */
export const STATUS_DEFAULT_BG = "#3F51B5";

/**
 * Luminance relative WCAG — la formule exacte de `Color.computeLuminance()`.
 *
 * L'app choisit le noir ou le blanc sur ce seuil (`> 0.5`) : sur un fond clair
 * le texte devient noir. Reproduire le calcul évite de montrer du blanc sur
 * jaune dans l'aperçu et du noir dans l'app.
 */
function relativeLuminance(hex: string): number {
  const v = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return 0;
  const channel = (i: number) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function statusForeground(backgroundColor?: string | null): string {
  const bg = backgroundColor?.trim() || STATUS_DEFAULT_BG;
  return relativeLuminance(bg) > 0.5 ? "#000000" : "#FFFFFF";
}

interface StatusPreviewProps {
  text: string;
  /** 0 texte · 1 image · 2 vidéo — dérivé de l'extension du média. */
  type: number;
  mediaUrl?: string | null;
  /** `#RRGGBB` ; vide ou invalide → indigo de marque, comme l'app. */
  backgroundColor?: string | null;
  senderName?: string;
  senderAvatar?: string | null;
  relativeTime?: string;
}

export function StatusPreview({
  text,
  type,
  mediaUrl,
  backgroundColor,
  senderName = "Alanya",
  senderAvatar,
  relativeTime = "à l'instant",
}: StatusPreviewProps) {
  const url = mediaUrl?.trim() || null;

  return (
    <div className="relative flex h-full flex-col bg-black">
      <div className="absolute inset-0">{renderContent(type, url, text, backgroundColor)}</div>

      {/* Barres de progression — _ProgressBars */}
      <div className="relative z-10 flex gap-1 px-2 pt-[38px]">
        <span className="h-[2.5px] flex-1 rounded-full bg-white" />
        <span className="h-[2.5px] flex-1 rounded-full bg-white/30" />
      </div>

      {/* En-tête — _Header, padding fromLTRB(12, 4, 4, 8) */}
      <div className="relative z-10 flex items-center pb-2 pl-3 pr-1 pt-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B2147]">
          {senderAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={senderAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[15px] text-white">
              {senderName.trim().charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div className="ml-2 min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-white">{senderName}</p>
          <p className="text-[12px] text-white/70">{relativeTime}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center">
          <X size={24} className="text-white" />
        </div>
      </div>

      <div className="flex-1" />

      {/* Pied — _Footer, dégradé vers le noir */}
      <div className="relative z-10 bg-gradient-to-t from-black/70 to-transparent px-3 pb-6 pt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center rounded-full border border-white/40 px-4 text-[15px] text-white/70">
            Répondre…
          </div>
          <div className="flex h-11 w-11 items-center justify-center">
            <Heart size={26} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderContent(
  type: number,
  url: string | null,
  text: string,
  backgroundColor?: string | null,
) {
  // type 1 — image, `BoxFit.contain` sur fond noir
  if (type === 1) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="text-[13px] text-white/50">Aucune image</p>
        )}
      </div>
    );
  }

  // type 2 — vidéo
  if (type === 2) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        {url ? (
          <video src={url} className="max-h-full max-w-full object-contain" muted playsInline preload="metadata" />
        ) : (
          <p className="text-[13px] text-white/50">Aucune vidéo</p>
        )}
        <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-black/50">
          <Play size={28} className="ml-1 text-white" fill="white" />
        </div>
      </div>
    );
  }

  // type 0 — texte : 28 px w600 centré, padding horizontal 24
  const bg = backgroundColor?.trim() || STATUS_DEFAULT_BG;
  return (
    <div
      className="flex h-full w-full items-center justify-center px-6"
      style={{ backgroundColor: bg }}
    >
      <p
        className="whitespace-pre-wrap break-words text-center text-[28px] font-semibold leading-[1.25]"
        style={{ color: statusForeground(bg) }}
      >
        {text || " "}
      </p>
    </div>
  );
}
