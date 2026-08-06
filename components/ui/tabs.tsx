"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ElementType;
  /** Pastille d'état affichée après le libellé (ex. « Actif »). */
  badge?: React.ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Préfixe des `id` ARIA — doit être identique côté `TabPanel`. */
  idPrefix: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * Onglets de niveau page.
 *
 * Style souligné, volontairement distinct des bascules en pilule utilisées dans
 * les formulaires (`LangTabs`, thème de l'aperçu) : ici on change de section, on
 * ne bascule pas une valeur. Confondre les deux traitements ferait lire les
 * onglets comme un réglage.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  idPrefix,
  className,
  "aria-label": ariaLabel,
}: TabsProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + items.length) % items.length;
    onChange(items[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex gap-1 border-b border-zinc-200 dark:border-zinc-800", className)}
    >
      {items.map((item, i) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.value}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            // Roving tabindex : un seul onglet dans l'ordre de tabulation,
            // les flèches circulent entre eux.
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "border-indigo-500 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:hover:border-zinc-700 dark:hover:text-zinc-200",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  value: string;
  active: boolean;
  idPrefix: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Panneau d'onglet.
 *
 * Les panneaux inactifs restent **montés** et simplement masqués : une saisie en
 * cours dans l'autre onglet ne doit pas disparaître parce qu'on est allé jeter
 * un œil à côté.
 */
export function TabPanel({ value, active, idPrefix, children, className }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      hidden={!active}
      className={className}
    >
      {children}
    </div>
  );
}

/** Pastille d'état pour un onglet — « Actif » / « Inactif ». */
export function TabStatePill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-zinc-400",
        )}
      />
      {label}
    </span>
  );
}
