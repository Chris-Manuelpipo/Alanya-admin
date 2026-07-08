const VALID_LENGTHS = [3, 4, 8] as const;

export function normalize(input: string | null | undefined): string {
  if (input == null) return '';
  return String(input).replace(/\D/g, '');
}

export function getTier(canonical: string): number | null {
  return VALID_LENGTHS.includes(canonical.length as (typeof VALID_LENGTHS)[number])
    ? canonical.length
    : null;
}

export function validate(canonical: string): string | null {
  if (!canonical) return 'Numéro Alanya requis';
  if (!/^\d+$/.test(canonical)) return 'Chiffres uniquement';
  if (!getTier(canonical)) return 'Numéro invalide : 3, 4 ou 8 chiffres requis';
  return null;
}

function groupDigits(digits: string, groups: number[]): string {
  const parts: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + size));
    i += size;
  }
  if (i < digits.length) parts.push(digits.slice(i));
  return parts.join(' ');
}

export function formatDisplay(canonical: string | null | undefined): string {
  const digits = normalize(canonical);
  if (!digits) return '';
  const tier = getTier(digits);
  if (tier === 3) return digits;
  if (tier === 4) return groupDigits(digits, [2, 2]);
  if (tier === 8) return groupDigits(digits, [2, 2, 2, 2]);
  return digits;
}

export function formatLiveInput(input: string): string {
  const digits = normalize(input);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 4) return groupDigits(digits, [2, 2]);
  return groupDigits(digits.slice(0, 8), [2, 2, 2, 2]);
}

export function isNumericQuery(q: string): boolean {
  return /^\d+$/.test(normalize(q));
}
