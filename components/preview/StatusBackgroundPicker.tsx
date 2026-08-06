"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { STATUS_DEFAULT_BG, statusForeground } from "./StatusPreview";

/**
 * Palette proposée aux statuts officiels.
 *
 * `value` vide = laisser la colonne à NULL, ce qui fait retomber l'app sur son
 * indigo de marque. On ne stocke donc pas la couleur par défaut en dur.
 */
export const STATUS_BACKGROUNDS = [
  { value: "", label: "Indigo Alanya", hex: STATUS_DEFAULT_BG },
  { value: "#1A237E", label: "Indigo profond", hex: "#1A237E" },
  { value: "#1FA363", label: "Vert", hex: "#1FA363" },
  { value: "#EF4444", label: "Rouge", hex: "#EF4444" },
  { value: "#F59E0B", label: "Ambre", hex: "#F59E0B" },
  { value: "#111827", label: "Noir", hex: "#111827" },
  { value: "#F2F3FB", label: "Blanc cassé", hex: "#F2F3FB" },
];

interface StatusBackgroundPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Choix de la couleur de fond d'un statut texte.
 *
 * Partagé par le statut de bienvenue et la diffusion de statut : les deux
 * finissent dans la même colonne `statut.backgroundColor` et doivent donc
 * offrir les mêmes choix et le même avertissement de lisibilité.
 */
export function StatusBackgroundPicker({
  value,
  onChange,
  label = "Couleur de fond",
  className,
}: StatusBackgroundPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {STATUS_BACKGROUNDS.map((b) => {
          const active = (value || "") === b.value;
          return (
            <button
              key={b.label}
              type="button"
              title={b.label}
              aria-label={b.label}
              aria-pressed={active}
              onClick={() => onChange(b.value)}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-transform",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "scale-110 border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 hover:scale-105 dark:border-zinc-700",
              )}
              style={{ backgroundColor: b.hex }}
            />
          );
        })}
      </div>
      <p className="text-xs text-zinc-400">
        Le texte passe automatiquement en noir sur un fond clair, comme dans l&apos;app.
      </p>
      {/* L'en-tête du viewer (nom, heure, croix) est toujours blanc dans l'app :
          sur un fond clair il devient illisible. L'aperçu le montre tel quel —
          autant l'expliquer plutôt que de le laisser découvrir en production. */}
      {statusForeground(value) === "#000000" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400">
          Fond clair : le nom et l&apos;heure en haut du statut restent blancs dans
          l&apos;app et deviennent difficiles à lire. Vérifiez le rendu dans
          l&apos;aperçu.
        </p>
      )}
    </div>
  );
}
