import type { PreviewLang } from "@/components/preview/types";
import { resolveTranslation, type Translations } from "@/lib/content-locales";

/**
 * Miroir de `resolveI18n` (Alanya-Backend/src/utils/localeContent.js).
 *
 * Parcourt : locale demandée → chaîne de repli (`en`, `fr`) → première valeur
 * non vide. Un champ laissé vide n'aboutit donc jamais à un aperçu vide, et un
 * lecteur chinois sans version chinoise voit l'anglais — pas le français.
 */
export function resolveLocalized(
  translations: Translations,
  lang: PreviewLang,
): string {
  return resolveTranslation(translations, lang);
}

/**
 * Variante héritée sur un couple fr/en.
 *
 * Conservée pour les éditeurs qui portent encore un état `contentFr` /
 * `contentEn` (message de bienvenue). À retirer quand ils passeront à
 * [Translations], en même temps que les colonnes `_fr`/`_en` du backend.
 */
export function pickLocalized(
  fr: string | null | undefined,
  en: string | null | undefined,
  lang: PreviewLang,
): string {
  return resolveTranslation({ fr: fr ?? undefined, en: en ?? undefined }, lang);
}
