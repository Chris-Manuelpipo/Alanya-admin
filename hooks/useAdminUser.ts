import { useEffect, useState } from "react";
import { getAdminUser } from "@/lib/auth";

// Lecture du rôle côté client uniquement (localStorage indisponible côté serveur)
// → évite tout décalage d'hydratation. Renvoie 0 tant que non monté.
export function useAdminRole(): number {
  const [role, setRole] = useState(0);
  useEffect(() => {
    const u = getAdminUser();
    setRole(u?.typeCompte ?? u?.type_compte ?? 0);
  }, []);
  return role;
}

export function useIsSuperAdmin(): boolean {
  return useAdminRole() >= 2;
}
