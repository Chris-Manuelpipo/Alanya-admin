import type { PreviewLang, PreviewMessage } from "@/components/preview/types";
import { statutMediaType } from "@/lib/broadcast-payload";
import { pickLocalized } from "./localized";

export interface BroadcastPreviewInput {
  /** 0 = message privé, 1 = statut 24 h. */
  kind: number;
  contentFr: string;
  contentEn?: string | null;
  /** Type média du message (0 texte · 1 image · 2 vidéo · 3 audio · 4 fichier). */
  type: number;
  mediaUrl?: string | null;
}

export type BroadcastPreviewResult =
  | { mode: "chat"; messages: PreviewMessage[] }
  | { mode: "status"; text: string; type: number; mediaUrl: string | null };

/**
 * Dérive l'aperçu d'une diffusion telle qu'elle sera réellement livrée.
 *
 * - `kind = 0` → un message unique dans la conversation officielle, matérialisé
 *   à la volée par `materializeForUser` (broadcastService.js:461).
 * - `kind = 1` → aucun message : une ligne `statut` est créée à la publication
 *   (broadcastService.js:125-136), et son type média est déduit de l'URL.
 */
export function broadcastToPreview(
  input: BroadcastPreviewInput,
  lang: PreviewLang,
): BroadcastPreviewResult {
  const text = pickLocalized(input.contentFr, input.contentEn, lang);
  const mediaUrl = input.mediaUrl?.trim() || null;

  if (input.kind === 1) {
    return { mode: "status", text, type: statutMediaType(mediaUrl), mediaUrl };
  }

  return {
    mode: "chat",
    messages: [{ type: input.type, content: text || null, mediaUrl }],
  };
}

/** Longueur du corps de la notification push (broadcastService.js:356-364). */
export const PUSH_BODY_MAX = 120;

/** Corps par défaut quand le contenu est vide — `defaultBroadcastPushBody`. */
export function defaultPushBody(kind: number, lang: PreviewLang): string {
  const isStatus = Number(kind) === 1;
  if (lang === "en") return isStatus ? "New status" : "New announcement";
  return isStatus ? "Nouveau statut" : "Nouvelle annonce";
}
