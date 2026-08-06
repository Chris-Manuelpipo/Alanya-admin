"use client";

import { ChatPreview } from "./ChatPreview";
import { PHONE_HEIGHT, PHONE_WIDTH, PhoneFrame } from "./PhoneFrame";
import { StatusPreview } from "./StatusPreview";
import type { AppTheme, PreviewLang, PreviewMessage } from "./types";

/** Ce que l'aperçu doit rendre — conversation ou statut, jamais les deux. */
export type PreviewContent =
  | {
      mode: "chat";
      messages: PreviewMessage[];
      senderName?: string;
      senderAvatar?: string | null;
      official?: boolean;
      emptyLabel?: string;
    }
  | {
      mode: "status";
      text: string;
      /** 0 texte · 1 image · 2 vidéo */
      type: number;
      mediaUrl?: string | null;
      /** `#RRGGBB` ; vide → indigo de marque. */
      backgroundColor?: string | null;
      senderName?: string;
      senderAvatar?: string | null;
    };

/**
 * Échelle qui fait tenir le téléphone dans la place disponible.
 *
 * Le rendu se fait toujours à `PHONE_WIDTH` px logiques puis est mis à
 * l'échelle : on n'a donc jamais à réajuster une cote pour un écran plus petit.
 */
export function fitScale(maxWidth: number, maxHeight?: number): number {
  const byWidth = maxWidth / (PHONE_WIDTH + 20);
  if (!maxHeight) return byWidth;
  return Math.min(byWidth, maxHeight / (PHONE_HEIGHT + 20));
}

interface PreviewStageProps {
  content: PreviewContent;
  theme: AppTheme;
  /** Localise le chrome de l'app (bandeau de lecture seule), pas le contenu. */
  lang?: PreviewLang;
  scale?: number;
  className?: string;
}

export function PreviewStage({ content, theme, lang = "fr", scale = 1, className }: PreviewStageProps) {
  return (
    <PhoneFrame
      // Le viewer de statut est plein écran : pas de barre d'état du système.
      chrome={content.mode === "status" ? "status" : "chat"}
      theme={theme}
      scale={scale}
      className={className}
    >
      {content.mode === "status" ? (
        <StatusPreview
          text={content.text}
          type={content.type}
          mediaUrl={content.mediaUrl}
          backgroundColor={content.backgroundColor}
          senderName={content.senderName}
          senderAvatar={content.senderAvatar}
        />
      ) : (
        <ChatPreview
          messages={content.messages}
          senderName={content.senderName}
          senderAvatar={content.senderAvatar}
          official={content.official}
          emptyLabel={content.emptyLabel}
          lang={lang}
        />
      )}
    </PhoneFrame>
  );
}
