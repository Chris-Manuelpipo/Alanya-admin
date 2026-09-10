/**
 * Abonnement Alanya Plus — appels d'administration.
 *
 * Les réponses arrivent en camelCase (`snakeToCamel`, lib/api.ts) ; les corps
 * envoyés partent tels qu'écrits, donc en snake_case explicite, comme le
 * backend les lit (src/services/billing/rules.js).
 */

import { api } from '@/lib/api';
import type {
  BillingFeature,
  BillingFeaturePatch,
  BillingPlan,
  BillingPlanPayload,
  BillingSettingsPatch,
  BillingSettingsResponse,
} from '@/types';

export async function fetchBillingSettings(): Promise<BillingSettingsResponse> {
  const res = await api.get('/admin/billing/settings');
  return res.data as BillingSettingsResponse;
}

export async function updateBillingSettings(payload: BillingSettingsPatch): Promise<BillingSettingsResponse> {
  const res = await api.put('/admin/billing/settings', payload);
  return res.data as BillingSettingsResponse;
}

/** Allume le payant : la grâce commence maintenant. Le motif est journalisé. */
export async function activateBilling(payload: { graceDays?: number; reason: string }): Promise<BillingSettingsResponse> {
  const res = await api.post('/admin/billing/activate', payload);
  return res.data as BillingSettingsResponse;
}

export async function deactivateBilling(reason: string): Promise<BillingSettingsResponse> {
  const res = await api.post('/admin/billing/deactivate', { reason });
  return res.data as BillingSettingsResponse;
}

export async function extendBillingGrace(payload: { graceUntil: string; reason: string }): Promise<BillingSettingsResponse> {
  const res = await api.post('/admin/billing/extend-grace', payload);
  return res.data as BillingSettingsResponse;
}

export async function fetchBillingPlans(): Promise<BillingPlan[]> {
  const res = await api.get('/admin/billing/plans');
  return (res.data?.plans ?? []) as BillingPlan[];
}

export async function createBillingPlan(payload: BillingPlanPayload): Promise<BillingPlan> {
  const res = await api.post('/admin/billing/plans', payload);
  return res.data?.plan as BillingPlan;
}

export async function updateBillingPlan(id: number, payload: Partial<BillingPlanPayload>): Promise<BillingPlan> {
  const res = await api.put(`/admin/billing/plans/${id}`, payload);
  return res.data?.plan as BillingPlan;
}

export async function fetchBillingFeatures(): Promise<BillingFeature[]> {
  const res = await api.get('/admin/billing/features');
  return (res.data?.features ?? []) as BillingFeature[];
}

export async function updateBillingFeature(code: string, payload: BillingFeaturePatch): Promise<BillingFeature[]> {
  const res = await api.put(`/admin/billing/features/${code}`, payload);
  return (res.data?.features ?? []) as BillingFeature[];
}
