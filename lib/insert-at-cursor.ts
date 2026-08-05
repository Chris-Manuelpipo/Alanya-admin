/** Insère du texte à la position du curseur dans un champ contrôlé. */
export function insertAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number } {
  const next = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
  return { next, cursor: selectionStart + insertion.length };
}
