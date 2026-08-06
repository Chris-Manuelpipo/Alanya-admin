"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountries } from "@/hooks/useCountries";
import { useVilles } from "@/hooks/useBroadcasts";
import { ACCOUNT_TYPE_LABELS, VERIFICATION_LABELS } from "@/lib/account-labels";
import type { BroadcastCriteria, BroadcastCriteriaField, BroadcastCriteriaOp } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export interface DraftCondition {
  id: string;
  field: BroadcastCriteriaField;
  op: BroadcastCriteriaOp;
  value: string;
  /** Borne haute de l'opérateur `between`. */
  value2?: string;
  idPaysForVille?: number;
}

/** Plafond serveur pour un `in` — criteriaResolver.js:17 (`MAX_IN_IDS`). */
export const MAX_IN_IDS = 500;

/** Plafond serveur — criteriaResolver.js:16 (`MAX_CONDITIONS`). */
export const MAX_CONDITIONS = 20;

const FIELDS: { value: BroadcastCriteriaField; label: string }[] = [
  { value: "idPays", label: "Pays" },
  { value: "idVille", label: "Ville" },
  { value: "genre", label: "Genre" },
  { value: "age", label: "Âge" },
  { value: "account_type", label: "Type de compte" },
  { value: "verification_status", label: "Vérification" },
  { value: "created_at", label: "Inscription" },
  { value: "last_seen", label: "Dernière activité" },
  { value: "verified_until", label: "Fin de vérification" },
  { value: "alanyaID", label: "Liste IDs" },
];

const DATE_FIELDS: BroadcastCriteriaField[] = ["created_at", "last_seen", "verified_until"];
const NUMERIC_SELECT_FIELDS: BroadcastCriteriaField[] = ["account_type", "verification_status"];

function newDraft(): DraftCondition {
  return { id: crypto.randomUUID(), field: "idPays", op: "eq", value: "" };
}

/** Liste d'IDs saisie librement → tableau d'entiers positifs, sans doublon. */
export function parseIdList(raw: string): number[] {
  const seen = new Set<number>();
  for (const chunk of raw.split(/[\s,;]+/)) {
    const n = Number(chunk.trim());
    if (Number.isInteger(n) && n > 0) seen.add(n);
  }
  return Array.from(seen);
}

/** Une condition est-elle exploitable ? Sert au filtrage et à la validation. */
function isComplete(d: DraftCondition): boolean {
  if (d.field === "alanyaID") return parseIdList(d.value).length > 0;
  if (d.field === "age" && d.op === "between") {
    return d.value.trim() !== "" && (d.value2 ?? "").trim() !== "";
  }
  return d.value.trim() !== "";
}

export function draftToCriteria(drafts: DraftCondition[]): BroadcastCriteria {
  const conditions = drafts.filter(isComplete).map((d) => {
    if (d.field === "age") {
      // `between` attend un couple [min, max] : un scalaire produit
      // `val >= undefined` côté serveur, donc une audience vide sans erreur
      // (criteriaResolver.js:133).
      if (d.op === "between") {
        const a = Number(d.value);
        const b = Number(d.value2);
        return { field: d.field, op: d.op, value: [Math.min(a, b), Math.max(a, b)] };
      }
      return { field: d.field, op: d.op, value: Number(d.value) };
    }
    if (
      d.field === "idPays" ||
      d.field === "idVille" ||
      d.field === "account_type" ||
      d.field === "verification_status"
    ) {
      return { field: d.field, op: d.op, value: Number(d.value) };
    }
    if (d.field === "alanyaID") {
      return { field: d.field, op: "in" as const, value: parseIdList(d.value).slice(0, MAX_IN_IDS) };
    }
    if (DATE_FIELDS.includes(d.field)) {
      return { field: d.field, op: d.op as "before" | "after", value: { relative: d.value } };
    }
    return { field: d.field, op: d.op, value: d.value };
  });
  return { v: 1, op: "and", conditions };
}

/** Messages bloquants — ce que le serveur refuserait. */
export function criteriaErrors(drafts: DraftCondition[]): string[] {
  const errors: string[] = [];
  if (drafts.filter(isComplete).length > MAX_CONDITIONS) {
    errors.push(`Maximum ${MAX_CONDITIONS} conditions.`);
  }
  for (const d of drafts) {
    if (d.field === "alanyaID" && parseIdList(d.value).length > MAX_IN_IDS) {
      errors.push(`Liste d'IDs limitée à ${MAX_IN_IDS} entrées.`);
    }
  }
  return errors;
}

interface CriteriaBuilderProps {
  drafts: DraftCondition[];
  onChange: (drafts: DraftCondition[]) => void;
}

export function CriteriaBuilder({ drafts, onChange }: CriteriaBuilderProps) {
  const { data: countries } = useCountries();

  function update(id: string, patch: Partial<DraftCondition>) {
    onChange(drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function remove(id: string) {
    onChange(drafts.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-3">
      {drafts.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Aucun critère — tous les utilisateurs éligibles.
        </p>
      )}
      {drafts.map((d) => (
        <ConditionRow
          key={d.id}
          draft={d}
          countries={countries}
          onUpdate={(p) => update(d.id, p)}
          onRemove={() => remove(d.id)}
        />
      ))}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={drafts.length >= MAX_CONDITIONS}
          onClick={() => onChange([...drafts, newDraft()])}
        >
          <Plus className="mr-1 h-4 w-4" /> Ajouter une condition
        </Button>
        {drafts.length > 1 && (
          <span className="text-xs text-zinc-400">
            Toutes les conditions doivent être vraies (ET)
          </span>
        )}
      </div>
    </div>
  );
}

const selectClass =
  "h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function ConditionRow({
  draft,
  countries,
  onUpdate,
  onRemove,
}: {
  draft: DraftCondition;
  countries?: { idPays: number; libelle: string }[];
  onUpdate: (p: Partial<DraftCondition>) => void;
  onRemove: () => void;
}) {
  const idPays =
    draft.idPaysForVille ?? (draft.field === "idPays" ? Number(draft.value) || undefined : undefined);
  const { data: villes } = useVilles(idPays ?? null, draft.field === "idVille" ? draft.value : "");
  const ids = draft.field === "alanyaID" ? parseIdList(draft.value) : [];

  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-zinc-100 p-2 dark:border-zinc-800">
      <select
        className={selectClass}
        aria-label="Critère"
        value={draft.field}
        onChange={(e) => {
          const field = e.target.value as BroadcastCriteriaField;
          onUpdate({
            field,
            value: "",
            value2: undefined,
            idPaysForVille: undefined,
            op: DATE_FIELDS.includes(field) ? "after" : field === "age" ? "lte" : "eq",
          });
        }}
      >
        {FIELDS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {draft.field === "genre" && (
        <select
          className={selectClass}
          aria-label="Genre"
          value={draft.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
        >
          <option value="">—</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
          <option value="autre">Autre</option>
          <option value="non_precise">Non précisé</option>
        </select>
      )}

      {draft.field === "idPays" && (
        <select
          className={`${selectClass} min-w-[140px]`}
          aria-label="Pays"
          value={draft.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
        >
          <option value="">—</option>
          {countries?.map((c) => (
            <option key={c.idPays} value={c.idPays}>
              {c.libelle}
            </option>
          ))}
        </select>
      )}

      {draft.field === "idVille" && (
        <>
          <select
            className={selectClass}
            aria-label="Pays de la ville"
            value={draft.idPaysForVille ?? ""}
            onChange={(e) => onUpdate({ idPaysForVille: Number(e.target.value), value: "" })}
          >
            <option value="">Pays…</option>
            {countries?.map((c) => (
              <option key={c.idPays} value={c.idPays}>
                {c.libelle}
              </option>
            ))}
          </select>
          <select
            className={`${selectClass} min-w-[140px]`}
            aria-label="Ville"
            value={draft.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
          >
            <option value="">Ville…</option>
            {villes?.map((v) => (
              <option key={v.idVille} value={v.idVille}>
                {v.libelle}
              </option>
            ))}
          </select>
        </>
      )}

      {draft.field === "age" && (
        <>
          <select
            className={selectClass}
            aria-label="Opérateur"
            value={draft.op}
            onChange={(e) => onUpdate({ op: e.target.value as BroadcastCriteriaOp })}
          >
            <option value="lte">≤</option>
            <option value="gte">≥</option>
            <option value="eq">=</option>
            <option value="between">entre</option>
          </select>
          <Input
            className="h-9 w-20"
            type="number"
            aria-label={draft.op === "between" ? "Âge minimum" : "Âge"}
            value={draft.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
          />
          {draft.op === "between" && (
            <>
              <span className="self-center text-sm text-zinc-400">et</span>
              <Input
                className="h-9 w-20"
                type="number"
                aria-label="Âge maximum"
                value={draft.value2 ?? ""}
                onChange={(e) => onUpdate({ value2: e.target.value })}
              />
            </>
          )}
        </>
      )}

      {NUMERIC_SELECT_FIELDS.includes(draft.field) && (
        <select
          className={`${selectClass} min-w-[140px]`}
          aria-label={draft.field === "account_type" ? "Type de compte" : "Vérification"}
          value={draft.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
        >
          <option value="">—</option>
          {Object.entries(
            draft.field === "account_type" ? ACCOUNT_TYPE_LABELS : VERIFICATION_LABELS,
          ).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      )}

      {DATE_FIELDS.includes(draft.field) && (
        <>
          <select
            className={selectClass}
            aria-label="Opérateur"
            value={draft.op}
            onChange={(e) => onUpdate({ op: e.target.value as BroadcastCriteriaOp })}
          >
            <option value="after">après</option>
            <option value="before">avant</option>
          </select>
          <Input
            className="h-9 w-32"
            placeholder="-30 days"
            aria-label="Décalage relatif"
            value={draft.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
          />
          <span className="self-center text-xs text-zinc-400">ex. -30 days, -24 hours</span>
        </>
      )}

      {draft.field === "alanyaID" && (
        <div className="min-w-[200px] flex-1 space-y-1">
          <Input
            className="h-9"
            placeholder="IDs séparés par virgule"
            aria-label="Liste d'identifiants"
            value={draft.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
          />
          <p
            className={`text-xs ${ids.length > MAX_IN_IDS ? "text-red-500" : "text-zinc-400"}`}
          >
            {ids.length} / {MAX_IN_IDS} identifiants
            {ids.length > MAX_IN_IDS ? " — au-delà, le serveur refuse la diffusion" : ""}
          </p>
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        aria-label="Retirer la condition"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4 text-zinc-400" />
      </Button>
    </div>
  );
}
