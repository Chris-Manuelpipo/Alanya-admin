/** Délai d'animation décalé pour effet cascade (ms). */
export function stagger(index: number, step = 70): string {
  return `${index * step}ms`;
}
