import type { PreviewLang } from "@/components/preview/types";

/**
 * Miroir de `pickLocalized` (Alanya-Backend/src/utils/localeContent.js:15-24).
 *
 * Règle exacte : en anglais on ne prend la variante EN que si elle est non nulle
 * **et non vide après trim** ; sinon on retombe sur le français. C'est ce qui
 * fait qu'un champ EN laissé vide n'aboutit pas à un message vide.
 */
export function pickLocalized(
  fr: string | null | undefined,
  en: string | null | undefined,
  lang: PreviewLang,
): string {
  if (lang === "en" && en != null && String(en).trim() !== "") return String(en);
  return fr != null ? String(fr) : "";
}
