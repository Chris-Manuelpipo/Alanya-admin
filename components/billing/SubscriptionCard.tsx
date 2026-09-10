"use client";

/**
 * Carte « Abonnement et coche » de la fiche utilisateur.
 *
 * Dit où en est le compte (actif, à venir, terminé, exempté), si la coche
 * s'affiche et pourquoi — c'est la question qu'on pose au support —, puis les
 * périodes et paiements récents. Offrir des mois se fait d'ici, motif
 * obligatoire.
 */

import { useState } from "react";
import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBadgeIcon } from "@/components/account-badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useBillingPlans, useUserBilling } from "@/hooks/useBilling";
import {
  PAYMENT_STATUS_CLASS, PAYMENT_STATUS_LABEL, PERIOD_SOURCE_LABEL, fmtDay, planLabel,
} from "@/lib/billing-labels";
import { formatFcfa } from "@/lib/plan-pricing";
import { cn } from "@/lib/utils";
import type { BillingPlan, UserBillingResponse } from "@/types";
import { GiftDialog } from "./GiftDialog";

const TONE = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  upcoming: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  ended: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const shortDay = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function describe(b: UserBillingResponse, plans?: BillingPlan[]) {
  const e = b.entitlements;
  if (e.exempt) {
    return { label: "Exempté", tone: TONE.neutral, detail: "Équipe ou compte officiel : jamais soumis à l'offre." };
  }
  if (e.period) {
    return {
      label: "Actif",
      tone: TONE.active,
      detail: `${planLabel(e.period.plan, plans)} jusqu'au ${fmtDay(e.period.endsAt)}`
        + (e.period.autoRenew ? " · renouvellement automatique" : ""),
    };
  }
  if (e.upcoming) {
    return {
      label: "À venir",
      tone: TONE.upcoming,
      detail: `${planLabel(e.upcoming.plan, plans)} à partir du ${fmtDay(e.upcoming.startsAt)}`,
    };
  }
  if (e.lapsedAt) {
    return { label: "Terminé", tone: TONE.ended, detail: `Depuis le ${fmtDay(e.lapsedAt)}.` };
  }
  return {
    label: "Aucun abonnement",
    tone: TONE.neutral,
    detail: e.phase === "paid"
      ? "Fonctionnalités Plus fermées pour ce compte."
      : `Tout reste ouvert pendant la phase ${e.phase === "free" ? "gratuite" : "de grâce"}.`,
  };
}

/** La coche = identité vérifiée ET droit `verified_badge` (abonnement en phase payante). */
function coche(b: UserBillingResponse, verified: boolean) {
  if (!verified) return { shown: false, why: "Identité non vérifiée." };
  if (b.entitlements.features.verifiedBadge === false) {
    return { shown: false, why: "Identité vérifiée, mais l'abonnement manque : la coche tombe en phase payante." };
  }
  return {
    shown: true,
    why: b.entitlements.phase === "free"
      ? "Identité vérifiée — suffisant pendant la phase gratuite."
      : "Identité vérifiée et abonnement actif.",
  };
}

export function SubscriptionCard({
  userId,
  userName,
  verified,
}: {
  userId: number;
  userName: string;
  verified: boolean;
}) {
  const { can } = usePermissions();
  const { data, isLoading, isError, refetch } = useUserBilling(userId);
  const { data: plans } = useBillingPlans();
  const [giftOpen, setGiftOpen] = useState(false);

  const state = data ? describe(data, plans) : null;
  const badge = data ? coche(data, verified) : null;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">Abonnement et coche</CardTitle>
        {data?.entitlements.tester && (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium" title="BILLING_TEST_USERS">
            Testeur
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {isError && (
          <div className="text-center">
            <p className="mb-2 text-xs text-red-500">Abonnement indisponible.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
          </div>
        )}

        {data && state && badge && (
          <>
            <div>
              <Badge className={cn("border-0", state.tone)}>{state.label}</Badge>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{state.detail}</p>
            </div>

            <div className="flex items-start gap-2.5 rounded-md bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900">
              {badge.shown ? (
                <AccountBadgeIcon accountType={0} verificationStatus={2} size={18} className="mt-px" />
              ) : (
                <span
                  aria-hidden
                  className="mt-px h-[18px] w-[18px] shrink-0 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700"
                />
              )}
              <div className="min-w-0">
                <p className="font-medium">{badge.shown ? "Coche affichée" : "Pas de coche"}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{badge.why}</p>
              </div>
            </div>

            {data.periods.length > 0 && (
              <section>
                <h4 className="mb-1 text-xs font-medium text-zinc-500">Périodes</h4>
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.periods.slice(0, 5).map((p) => (
                    <li key={p.id} className="py-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs tabular-nums">
                          {shortDay(p.startsAt)} → {shortDay(p.endsAt)}
                        </span>
                        <span className="shrink-0 text-xs text-zinc-500">{PERIOD_SOURCE_LABEL[p.source] ?? "—"}</span>
                      </div>
                      {p.source !== 0 && (p.grantedByName || p.reason) && (
                        <p className="truncate text-xs text-zinc-400" title={p.reason ?? undefined}>
                          {[p.grantedByName && `par ${p.grantedByName}`, p.reason].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.payments.length > 0 && (
              <section>
                <h4 className="mb-1 text-xs font-medium text-zinc-500">Paiements</h4>
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.payments.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="text-xs tabular-nums">
                        {shortDay(p.createdAt)} · <span className="font-medium">{formatFcfa(p.amount)}</span>
                      </span>
                      <Badge className={cn("border-0 px-1.5 py-0 text-[10px]", PAYMENT_STATUS_CLASS[p.status])}>
                        {PAYMENT_STATUS_LABEL[p.status] ?? p.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {can("billing.gift") && !data.entitlements.exempt && (
              <Button variant="outline" className="w-full" onClick={() => setGiftOpen(true)}>
                <Gift className="mr-2 h-4 w-4" />
                Offrir des mois
              </Button>
            )}
          </>
        )}
      </CardContent>

      {data && (
        <GiftDialog
          open={giftOpen}
          onOpenChange={setGiftOpen}
          userId={userId}
          userName={userName}
          currentEnd={data.subscriber?.currentEnd ?? null}
          graceUntil={data.entitlements.graceUntil}
        />
      )}
    </Card>
  );
}
