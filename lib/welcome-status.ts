import type { Translations } from "@/lib/content-locales";
import type { WelcomeStatusBlock, WelcomeStatusConfig } from "@/types";

/**
 * Forme héritée du statut de bienvenue : un seul contenu, à plat.
 *
 * C'est ce que renvoie un serveur antérieur à la migration 071. Les deux
 * formes cohabitent le temps du déploiement — sans quoi l'écran s'ouvrirait
 * vide sur un statut pourtant configuré.
 */
interface LegacyWelcomeStatus {
  type?: number;
  textFr?: string;
  textEn?: string;
  translations?: Translations;
  mediaUrl?: string;
  backgroundColor?: string;
}

type RawWelcomeStatus = Partial<WelcomeStatusConfig> & LegacyWelcomeStatus;

/** Élément vide, prêt à être rempli dans l'éditeur. */
export function emptyStatusBlock(type: number, sortOrder: number): WelcomeStatusBlock {
  return { sortOrder, type, translations: {}, mediaUrl: "", backgroundColor: "" };
}

/**
 * Réponse du serveur ramenée à la forme « suite d'éléments ».
 *
 * Un serveur d'avant la 071 ne connaît que le statut unique : on le présente
 * comme un premier élément, ce qui garde l'écran utilisable pendant la fenêtre
 * de déploiement. Ses traductions sont complétées par `textFr`/`textEn`, qui
 * restent la seule source tant que la table de traductions n'existe pas.
 */
export function normalizeWelcomeStatus(raw: RawWelcomeStatus | null | undefined): WelcomeStatusConfig {
  const base = {
    enabled: !!raw?.enabled,
    updatedAt: raw?.updatedAt ?? null,
    updatedBy: raw?.updatedBy ?? null,
    // `blocks` dans la réponse = serveur à jour. C'est le seul signal fiable :
    // un serveur d'avant la 071 ne renvoie jamais ce champ.
    supportsMultiple: Array.isArray(raw?.blocks),
  };

  if (Array.isArray(raw?.blocks)) {
    return {
      ...base,
      blocks: raw.blocks.map((b, i) => ({
        ...b,
        sortOrder: i,
        translations: b.translations ?? {},
        mediaUrl: b.mediaUrl ?? "",
        backgroundColor: b.backgroundColor ?? "",
      })),
    };
  }

  const translations: Translations = { ...(raw?.translations ?? {}) };
  if (!translations.fr?.trim() && raw?.textFr?.trim()) translations.fr = raw.textFr;
  if (!translations.en?.trim() && raw?.textEn?.trim()) translations.en = raw.textEn;

  const hasContent = Object.values(translations).some((v) => v?.trim()) || !!raw?.mediaUrl;
  if (!hasContent) return { ...base, blocks: [] };

  return {
    ...base,
    blocks: [
      {
        sortOrder: 0,
        type: raw?.type ?? 0,
        translations,
        mediaUrl: raw?.mediaUrl ?? "",
        backgroundColor: raw?.backgroundColor ?? "",
      },
    ],
  };
}

/**
 * Corps du `PUT`, dans les deux formes.
 *
 * Le premier élément est aussi envoyé à plat : un serveur d'avant la 071 ne
 * lirait pas `blocks` et enregistrerait un statut vide, effaçant le contenu au
 * premier enregistrement. Les éléments suivants, eux, ne survivent qu'une fois
 * le serveur à jour.
 */
export function welcomeStatusPayload(config: WelcomeStatusConfig) {
  const first = config.blocks[0];
  return {
    enabled: config.enabled,
    blocks: config.blocks,
    type: first?.type ?? 0,
    translations: first?.translations ?? {},
    mediaUrl: first?.mediaUrl ?? "",
    backgroundColor: first?.backgroundColor ?? "",
  };
}
