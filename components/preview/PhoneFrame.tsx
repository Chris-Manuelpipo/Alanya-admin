"use client";

import { cn } from "@/lib/utils";
import type { AppTheme } from "./types";

/**
 * Largeur logique du téléphone simulé, en pixels CSS.
 *
 * On rend TOUJOURS à cette largeur puis on met à l'échelle avec `transform`.
 * C'est la clé de la fidélité : toutes les cotes relevées dans le code Flutter
 * (padding 16/12, bulle à 75 % de l'écran, texte 15 px…) sont posées telles
 * quelles, et le texte reste vectoriel donc net à n'importe quelle échelle.
 */
export const PHONE_WIDTH = 390;

/** Hauteur logique — proche d'un écran 19.5:9 hors barres système. */
export const PHONE_HEIGHT = 780;

interface PhoneFrameProps {
  theme: AppTheme;
  /** 1 = taille réelle. ~0.62 pour la colonne latérale. */
  scale?: number;
  /** `status` masque la barre d'état claire : le viewer est plein écran noir. */
  chrome?: "chat" | "status";
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function PhoneFrame({
  theme,
  scale = 1,
  chrome = "chat",
  height = PHONE_HEIGHT,
  className,
  children,
}: PhoneFrameProps) {
  // Le biseau ajoute 10 px de bordure de chaque côté, à l'échelle lui aussi.
  const outerWidth = (PHONE_WIDTH + 20) * scale;
  const outerHeight = (height + 20) * scale;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: outerWidth, height: outerHeight }}
    >
      <div
        style={{
          width: PHONE_WIDTH + 20,
          height: height + 20,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        className="absolute left-0 top-0"
      >
        <div
          className={cn(
            "h-full w-full rounded-[46px] border-[10px] border-zinc-900 bg-zinc-900",
            "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]",
            "dark:border-zinc-800 dark:bg-zinc-800",
          )}
        >
          <div
            data-app-theme={theme}
            className="relative h-full w-full overflow-hidden rounded-[36px]"
            style={{ fontFamily: "var(--app-font)" }}
          >
            <StatusBar chrome={chrome} />
            <div className="absolute inset-0 flex flex-col">
              {chrome === "chat" ? <div className="h-[34px] shrink-0" /> : null}
              {children}
            </div>
            {/* Îlot / encoche — au-dessus de la barre d'état, qui est opaque. */}
            <div className="pointer-events-none absolute left-1/2 top-[9px] z-20 h-[26px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
            {/* Barre de geste — teintée par l'app, pas par la page qui l'entoure. */}
            <div
              className="pointer-events-none absolute bottom-[7px] left-1/2 h-[4px] w-[132px] -translate-x-1/2 rounded-full opacity-30"
              style={{
                backgroundColor: chrome === "status" ? "#FFFFFF" : "var(--app-on-surface)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Barre d'état — heure, réseau, Wi-Fi, batterie.
 *
 * En conversation elle se pose sur la couleur de l'app bar, comme sur un vrai
 * téléphone : sans ce fond, le texte tombe sur le biseau et devient illisible.
 * Sur le viewer de statut elle reste transparente en blanc, par-dessus le média.
 */
function StatusBar({ chrome }: { chrome: "chat" | "status" }) {
  const overMedia = chrome === "status";
  return (
    <div
      className="absolute inset-x-0 top-0 z-10 flex h-[34px] items-center justify-between px-[22px] text-[13px] font-semibold"
      style={{
        color: overMedia ? "#FFFFFF" : "var(--app-status-bar-fg)",
        backgroundColor: overMedia ? "transparent" : "var(--app-surface)",
      }}
    >
      <span className="tabular-nums tracking-tight">09:41</span>
      <div className="flex items-center gap-[5px]">
        {/* Réseau */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7.5" width="3" height="3.5" rx="1" />
          <rect x="4.7" y="5.5" width="3" height="5.5" rx="1" />
          <rect x="9.4" y="3" width="3" height="8" rx="1" />
          <rect x="14.1" y="0" width="3" height="11" rx="1" opacity="0.35" />
        </svg>
        {/* Wi-Fi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden>
          <path
            d="M1 3.6a9.6 9.6 0 0 1 13 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M3.6 6.3a5.9 5.9 0 0 1 7.8 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="7.5" cy="9.3" r="1.4" fill="currentColor" />
        </svg>
        {/* Batterie */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect
            x="0.6"
            y="0.6"
            width="21"
            height="10.8"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.4"
          />
          <rect x="2.3" y="2.3" width="15" height="7.4" rx="1.8" fill="currentColor" />
          <path
            d="M23.3 4.2v3.6a2 2 0 0 0 0-3.6Z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
