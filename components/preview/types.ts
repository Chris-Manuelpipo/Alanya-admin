import type { ContentLocale } from "@/lib/content-locales";

/**
 * Format de message de l'aperçu.
 *
 * Volontairement identique au format que le backend écrit réellement en base
 * (`message.type` / `content` / `mediaUrl`) : l'aperçu traverse ainsi le même
 * chemin de décodage que l'app mobile, au lieu d'un modèle intermédiaire qui
 * dériverait avec le temps.
 */
export interface PreviewMessage {
  /** 0 texte · 1 image · 2 vidéo · 3 audio · 4 fichier · 8 boutons CTA */
  type: number;
  content: string | null;
  mediaUrl: string | null;
}

/** Type de message CTA de bienvenue — `WELCOME_CTA_MSG_TYPE` côté serveur. */
export const WELCOME_CTA_MSG_TYPE = 8;

export interface PreviewCtaButton {
  label: string;
  action: "route" | "url";
  target: string;
}

/**
 * Miroir de `WelcomeCtaPayload.tryParse`
 * (Alanya/lib/core/utils/welcome_cta_payload.dart).
 *
 * Reproduit notamment le rejet des boutons dont le libellé **ou** la cible est
 * vide : c'est ce qui montre à l'administrateur qu'un bouton incomplet
 * n'atteindra jamais l'utilisateur.
 */
export function parseCtaPayload(raw: string | null | undefined): PreviewCtaButton[] | null {
  if (!raw || raw.trim() === "") return null;
  try {
    const map = JSON.parse(raw) as unknown;
    if (typeof map !== "object" || map === null) return null;
    const list = (map as { buttons?: unknown }).buttons;
    if (!Array.isArray(list)) return null;

    const buttons: PreviewCtaButton[] = [];
    for (const item of list) {
      if (typeof item !== "object" || item === null) continue;
      const row = item as Record<string, unknown>;
      const label = row.label == null ? "" : String(row.label);
      const target = row.target == null ? "" : String(row.target);
      const action = row.action == null ? "route" : String(row.action);
      if (!label || !target) continue;
      buttons.push({ label, action: action === "url" ? "url" : "route", target });
    }
    return buttons.length > 0 ? buttons : null;
  } catch {
    return null;
  }
}

/** Thème de l'app rendu dans l'aperçu — indépendant du thème de l'admin. */
export type AppTheme = "light" | "dark";

/**
 * Langue de l'aperçu — alignée sur les langues du contenu officiel.
 *
 * Alias plutôt qu'union figée : ajouter une langue dans `CONTENT_LOCALES` la
 * rend aussitôt prévisualisable, sans qu'un second endroit ne dérive.
 */
export type PreviewLang = ContentLocale;
