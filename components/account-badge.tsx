import { BadgeCheck, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

/** Miroir de `kOfficialSealGold` — account_badge.dart */
export const OFFICIAL_SEAL_GOLD = "#c9a227";

/** Miroir de `kVerifiedIndigo` — account_badge.dart (brandPrimary de l'app). */
export const VERIFIED_INDIGO = "#3F51B5";

export type AccountBadgeKind =
  | "none"
  | "cocheVerifiee"
  | "panierDeclare"
  | "panierVerifie"
  | "officiel";

/** Miroir de `resolveAccountBadge` — account_badge.dart */
export function resolveAccountBadge(
  accountType: number,
  verificationStatus: number,
): AccountBadgeKind {
  if (accountType === 2) return "officiel";
  if (accountType === 1) {
    return verificationStatus === 2 ? "panierVerifie" : "panierDeclare";
  }
  // Compte personnel : la coche n'apparaît que vérifié. Un compte personnel
  // en attente, refusé, révoqué ou expiré n'affiche rien.
  return verificationStatus === 2 ? "cocheVerifiee" : "none";
}

export function isOfficialAlanyaAccount(user: { accountType?: number }) {
  return user.accountType === 2;
}

/**
 * Le sceau festonné des documents de conception : rosace à 12 lobes,
 * r(t) = R + A·cos(12t), dans un viewBox de 24. Un disque plein se confondrait
 * avec un avatar ou une pastille de comptage ; le feston se reconnaît même à
 * 12 px. Échantillonné sans lissage : une courbe lissée transformerait les
 * lobes en pointes.
 */
export function sealPath(R = 10.6, A = 1.25, lobes = 12, steps = 288): string {
  let d = "";
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R + A * Math.cos(lobes * t);
    d += `${i === 0 ? "M" : "L"}${(12 + r * Math.cos(t)).toFixed(2)} ${(12 + r * Math.sin(t)).toFixed(2)}`;
  }
  return `${d}Z`;
}

const SEAL_PATH = sealPath();

function VerifiedSeal({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label="Compte vérifié"
      className={cn("shrink-0", className)}
    >
      <path d={SEAL_PATH} fill={VERIFIED_INDIGO} />
      <path
        d="M6.6 12.4 10.1 15.9 17.6 8.2"
        transform="translate(12 12) scale(0.86) translate(-12 -12)"
        fill="none"
        stroke="#fff"
        strokeWidth={2.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  if (badge === "cocheVerifiee") {
    return <VerifiedSeal size={size} className={className} />;
  }

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
