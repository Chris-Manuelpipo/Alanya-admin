import { BadgeCheck, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

/** Miroir de `kOfficialSealGold` — account_badge.dart */
export const OFFICIAL_SEAL_GOLD = "#c9a227";

export type AccountBadgeKind = "none" | "panierDeclare" | "panierVerifie" | "officiel";

/** Miroir de `resolveAccountBadge` — account_badge.dart */
export function resolveAccountBadge(
  accountType: number,
  verificationStatus: number,
): AccountBadgeKind {
  if (accountType === 2) return "officiel";
  if (accountType === 1) {
    return verificationStatus === 2 ? "panierVerifie" : "panierDeclare";
  }
  return "none";
}

export function isOfficialAlanyaAccount(user: { accountType?: number }) {
  return user.accountType === 2;
}

interface AccountBadgeIconProps {
  accountType: number;
  verificationStatus: number;
  size?: number;
  className?: string;
  /** Contour du sceau officiel (ex. fond app bar en preview). Défaut : blanc. */
  sealStroke?: string;
}

/** Miroir de `AccountBadgeIcon` — account_badge.dart */
export function AccountBadgeIcon({
  accountType,
  verificationStatus,
  size = 14,
  className,
  sealStroke = "white",
}: AccountBadgeIconProps) {
  const badge = resolveAccountBadge(accountType, verificationStatus);
  if (badge === "none") return null;

  if (badge === "officiel") {
    return (
      <BadgeCheck
        size={size}
        className={cn("shrink-0", className)}
        style={{ color: OFFICIAL_SEAL_GOLD }}
        fill={OFFICIAL_SEAL_GOLD}
        stroke={sealStroke}
      />
    );
  }

  if (badge === "panierVerifie") {
    return (
      <ShoppingBag
        size={size}
        className={cn("shrink-0 text-green-700 dark:text-green-500", className)}
      />
    );
  }

  return (
    <ShoppingBag
      size={size}
      className={cn("shrink-0 text-slate-500 dark:text-slate-400", className)}
      strokeWidth={1.5}
    />
  );
}

interface AccountBadgeLabelProps {
  name: string;
  accountType: number;
  verificationStatus: number;
  className?: string;
  nameClassName?: string;
  /** Taille de base du texte pour calculer l'icône (fontSize + 2). */
  fontSize?: number;
  sealStroke?: string;
}

/** Miroir de `AccountBadgeLabel` — account_badge.dart */
export function AccountBadgeLabel({
  name,
  accountType,
  verificationStatus,
  className,
  nameClassName,
  fontSize = 14,
  sealStroke,
}: AccountBadgeLabelProps) {
  const badge = resolveAccountBadge(accountType, verificationStatus);
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center", className)}>
      <span className={cn("truncate", nameClassName)}>{name}</span>
      {badge !== "none" ? (
        <AccountBadgeIcon
          accountType={accountType}
          verificationStatus={verificationStatus}
          size={fontSize + 2}
          className="ml-1"
          sealStroke={sealStroke}
        />
      ) : null}
    </span>
  );
}
