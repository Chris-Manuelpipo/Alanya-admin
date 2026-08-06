import {
  WELCOME_CTA_MSG_TYPE,
  type PreviewLang,
  type PreviewMessage,
} from "@/components/preview/types";
import type { WelcomeBlock, WelcomeCtaButton } from "@/types";
import { pickLocalized } from "./localized";

/**
 * Transforme les blocs de l'éditeur en messages de conversation, **exactement**
 * comme `blockToMessagePayload`
 * (Alanya-Backend/src/services/welcomeService.js:110-150).
 *
 * Reproduire cette fonction plutôt que d'inventer un rendu direct est ce qui
 * rend l'aperçu digne de confiance : un bloc qui ne produit rien côté serveur
 * ne doit rien produire à l'écran non plus.
 */
export function welcomeBlocksToMessages(
  blocks: WelcomeBlock[],
  lang: PreviewLang,
): PreviewMessage[] {
  return [...blocks]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((block) => blockToMessage(block, lang))
    .filter((m): m is PreviewMessage => m !== null);
}

function blockToMessage(block: WelcomeBlock, lang: PreviewLang): PreviewMessage | null {
  switch (block.blockType) {
    case "text":
      return {
        type: 0,
        content: pickLocalized(block.contentFr, block.contentEn, lang),
        mediaUrl: null,
      };

    case "image":
      return {
        type: 1,
        content: pickLocalized(block.contentFr, block.contentEn, lang) || null,
        mediaUrl: block.mediaUrl || null,
      };

    case "video":
      return {
        type: 2,
        content: pickLocalized(block.contentFr, block.contentEn, lang) || null,
        mediaUrl: block.mediaUrl || null,
      };

    case "cta": {
      const raw = block.ctaJson?.buttons ?? [];
      const buttons = raw
        .map((btn: WelcomeCtaButton) => ({
          label: lang === "en" ? btn.labelEn || btn.labelFr || "" : btn.labelFr || btn.labelEn || "",
          action: btn.action === "url" ? ("url" as const) : ("route" as const),
          target: String(btn.target || ""),
        }))
        // Un bouton sans libellé OU sans cible est écarté par le serveur.
        .filter((b) => b.label && b.target);

      return {
        type: WELCOME_CTA_MSG_TYPE,
        content: JSON.stringify({ buttons }),
        mediaUrl: null,
      };
    }

    default:
      return null;
  }
}
