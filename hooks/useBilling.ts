import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateBilling,
  createBillingPlan,
  deactivateBilling,
  extendBillingGrace,
  fetchBillingFeatures,
  fetchBillingPlans,
  fetchBillingSettings,
  updateBillingFeature,
  updateBillingPlan,
  updateBillingSettings,
} from "@/lib/api/billing";
import type { BillingFeaturePatch, BillingPlanPayload, BillingSettingsPatch } from "@/types";

const SETTINGS = ["admin-billing-settings"];
const PLANS = ["admin-billing-plans"];
const FEATURES = ["admin-billing-features"];

export function useBillingSettings() {
  return useQuery({ queryKey: SETTINGS, queryFn: fetchBillingSettings });
}

/**
 * Chaque transition renvoie l'état complet : on le pose en cache plutôt que de
 * relire — et l'activité admin, qui vient d'enregistrer le geste, est rafraîchie.
 */
function useSettingsMutation<V>(fn: (v: V) => ReturnType<typeof fetchBillingSettings>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      qc.setQueryData(SETTINGS, data);
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
  });
}

export const useUpdateBillingSettings = () =>
  useSettingsMutation((p: BillingSettingsPatch) => updateBillingSettings(p));
export const useActivateBilling = () =>
  useSettingsMutation((p: { graceDays?: number; reason: string }) => activateBilling(p));
export const useDeactivateBilling = () =>
  useSettingsMutation((reason: string) => deactivateBilling(reason));
export const useExtendBillingGrace = () =>
  useSettingsMutation((p: { graceUntil: string; reason: string }) => extendBillingGrace(p));

export function useBillingPlans() {
  return useQuery({ queryKey: PLANS, queryFn: fetchBillingPlans });
}

export function useCreateBillingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: BillingPlanPayload) => createBillingPlan(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS }),
  });
}

export function useUpdateBillingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BillingPlanPayload> }) =>
      updateBillingPlan(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS }),
  });
}

export function useBillingFeatures() {
  return useQuery({ queryKey: FEATURES, queryFn: fetchBillingFeatures });
}

export function useUpdateBillingFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: BillingFeaturePatch }) =>
      updateBillingFeature(code, payload),
    onSuccess: (features) => qc.setQueryData(FEATURES, features),
  });
}
