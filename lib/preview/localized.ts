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
