import { ACCOUNT_TYPE_LABELS, VERIFICATION_LABELS } from '@/lib/account-labels';
import type {
  BroadcastCriteria,
  BroadcastCriteriaField,
  BroadcastCriteriaOp,
  BroadcastCondition,
} from '@/types';

const FIELD_LABELS: Record<BroadcastCriteriaField, string> = {
  idPays: 'Pays',
  idVille: 'Ville',
  genre: 'Genre',
  age: 'Âge',
  account_type: 'Type de compte',
  verification_status: 'Vérification',
  created_at: 'Inscription',
  last_seen: 'Dernière activité',
  verified_until: 'Expiration vérif.',
  alanyaID: 'IDs Alanya',
};

const GENRE_LABELS: Record<string, string> = {
  homme: 'Hommes',
  femme: 'Femmes',
  autre: 'Autre',
  non_precise: 'Non précisé',
};

export function formatCriteriaSummary(
  criteria: BroadcastCriteria | null | undefined,
  ctx?: { countryName?: (id: number) => string | undefined; villeName?: (id: number) => string | undefined },
): string {
  if (!criteria?.conditions?.length) return 'Tous les utilisateurs';
  return criteria.conditions
    .map((c) => formatCondition(c, ctx))
    .join(' · ');
}

function formatCondition(
  c: BroadcastCondition,
  ctx?: { countryName?: (id: number) => string | undefined; villeName?: (id: number) => string | undefined },
): string {
  const label = FIELD_LABELS[c.field] || c.field;
  if (c.field === 'idPays' && c.op === 'eq') {
    const name = ctx?.countryName?.(Number(c.value));
    return name ? `${label} = ${name}` : `${label} = ${c.value}`;
  }
  if (c.field === 'idVille' && c.op === 'eq') {
    const name = ctx?.villeName?.(Number(c.value));
    return name ? `${label} = ${name}` : `${label} = ${c.value}`;
  }
  if (c.field === 'genre' && c.op === 'eq') {
    return GENRE_LABELS[String(c.value)] || String(c.value);
  }
  if (c.field === 'account_type' && c.op === 'eq') {
    return ACCOUNT_TYPE_LABELS[Number(c.value)] || String(c.value);
  }
  if (c.field === 'verification_status' && c.op === 'eq') {
    return `${label} : ${VERIFICATION_LABELS[Number(c.value)] || String(c.value)}`;
  }
  if (c.field === 'alanyaID' && c.op === 'in' && Array.isArray(c.value)) {
    return `${c.value.length} identifiant(s)`;
  }
  if (c.op === 'between' && Array.isArray(c.value)) {
    return `${label} entre ${c.value[0]} et ${c.value[1]}`;
  }
  if (c.op === 'lte' || c.op === 'gte' || c.op === 'lt' || c.op === 'gt') {
    const symbols: Record<string, string> = { lte: '≤', gte: '≥', lt: '<', gt: '>' };
    return `${label} ${symbols[c.op]} ${c.value}`;
  }
  if (c.op === 'before' || c.op === 'after') {
    const rel = (c.value as { relative?: string })?.relative;
    if (rel) return `${label} ${c.op === 'before' ? 'avant' : 'après'} ${rel}`;
  }
  return `${label} ${c.op} ${JSON.stringify(c.value)}`;
}

export type { BroadcastCriteriaField, BroadcastCriteriaOp, BroadcastCondition };
