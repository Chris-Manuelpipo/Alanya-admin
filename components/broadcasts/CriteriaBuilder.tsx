"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountries } from "@/hooks/useCountries";
import { useVilles } from "@/hooks/useBroadcasts";
import type { BroadcastCriteria, BroadcastCriteriaField, BroadcastCriteriaOp } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export interface DraftCondition {
  id: string;
  field: BroadcastCriteriaField;
  op: BroadcastCriteriaOp;
  value: string;
  value2?: string;
  idPaysForVille?: number;
}

const FIELDS: { value: BroadcastCriteriaField; label: string }[] = [
  { value: "idPays", label: "Pays" },
  { value: "idVille", label: "Ville" },
  { value: "genre", label: "Genre" },
  { value: "age", label: "Âge" },
  { value: "account_type", label: "Type de compte" },
  { value: "verification_status", label: "Vérification" },
  { value: "created_at", label: "Inscription" },
  { value: "last_seen", label: "Dernière activité" },
  { value: "alanyaID", label: "Liste IDs" },
];

function newDraft(): DraftCondition {
  return { id: crypto.randomUUID(), field: "idPays", op: "eq", value: "" };
}

export function draftToCriteria(drafts: DraftCondition[]): BroadcastCriteria {
  const conditions = drafts
    .filter((d) => d.value.trim() !== "" || d.field === "age")
    .map((d) => {
      if (d.field === "age") {
        const n = Number(d.value);
        return { field: d.field, op: d.op, value: n };
      }
      if (d.field === "idPays" || d.field === "idVille" || d.field === "account_type" || d.field === "verification_status") {
        return { field: d.field, op: d.op, value: Number(d.value) };
      }
      if (d.field === "alanyaID") {
        const ids = d.value.split(/[\s,;]+/).map((x) => Number(x.trim())).filter((n) => n > 0);
        return { field: d.field, op: "in" as const, value: ids };
      }
      if (d.field === "created_at" || d.field === "last_seen" || d.field === "verified_until") {
        return { field: d.field, op: d.op as "before" | "after", value: { relative: d.value } };
      }
      return { field: d.field, op: d.op, value: d.value };
    });
  return { v: 1, op: "and", conditions };
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
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Critères (AND)</p>
      {drafts.length === 0 && (
        <p className="text-sm text-zinc-400">Aucun critère — tous les utilisateurs éligibles.</p>
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
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...drafts, newDraft()])}>
        <Plus className="h-4 w-4 mr-1" /> Ajouter une condition
      </Button>
    </div>
  );
}

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
  const idPays = draft.idPaysForVille ?? (draft.field === "idPays" ? Number(draft.value) || undefined : undefined);
  const { data: villes } = useVilles(idPays ?? null, draft.field === "idVille" ? draft.value : "");

  return (
    <div className="flex flex-wrap gap-2 items-start p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
      <select
        className="text-sm border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-900"
        value={draft.field}
        onChange={(e) => onUpdate({ field: e.target.value as BroadcastCriteriaField, value: "", op: "eq" })}
      >
        {FIELDS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {draft.field === "genre" && (
        <select className="text-sm border rounded-md px-2 py-1.5" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })}>
          <option value="">—</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
          <option value="autre">Autre</option>
          <option value="non_precise">Non précisé</option>
        </select>
      )}

      {draft.field === "idPays" && (
        <select className="text-sm border rounded-md px-2 py-1.5 min-w-[140px]" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })}>
          <option value="">—</option>
          {countries?.map((c) => (
            <option key={c.idPays} value={c.idPays}>{c.libelle}</option>
          ))}
        </select>
      )}

      {draft.field === "idVille" && (
        <>
          <select
            className="text-sm border rounded-md px-2 py-1.5"
            value={draft.idPaysForVille ?? ""}
            onChange={(e) => onUpdate({ idPaysForVille: Number(e.target.value), value: "" })}
          >
            <option value="">Pays…</option>
            {countries?.map((c) => (
              <option key={c.idPays} value={c.idPays}>{c.libelle}</option>
            ))}
          </select>
          <select className="text-sm border rounded-md px-2 py-1.5 min-w-[140px]" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })}>
            <option value="">Ville…</option>
            {villes?.map((v) => (
              <option key={v.idVille} value={v.idVille}>{v.libelle}</option>
            ))}
          </select>
        </>
      )}

      {draft.field === "age" && (
        <>
          <select className="text-sm border rounded-md px-2 py-1.5" value={draft.op} onChange={(e) => onUpdate({ op: e.target.value as BroadcastCriteriaOp })}>
            <option value="lte">≤</option>
            <option value="gte">≥</option>
            <option value="eq">=</option>
            <option value="between">entre</option>
          </select>
          <Input className="w-20 h-9" type="number" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })} />
        </>
      )}

      {(draft.field === "account_type" || draft.field === "verification_status") && (
        <Input className="w-24 h-9" type="number" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })} />
      )}

      {(draft.field === "created_at" || draft.field === "last_seen" || draft.field === "verified_until") && (
        <>
          <select className="text-sm border rounded-md px-2 py-1.5" value={draft.op} onChange={(e) => onUpdate({ op: e.target.value as BroadcastCriteriaOp })}>
            <option value="after">après</option>
            <option value="before">avant</option>
          </select>
          <Input className="w-32 h-9" placeholder="-30 days" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })} />
        </>
      )}

      {draft.field === "alanyaID" && (
        <Input className="flex-1 min-w-[160px] h-9" placeholder="IDs séparés par virgule" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })} />
      )}

      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-zinc-400" />
      </Button>
    </div>
  );
}
