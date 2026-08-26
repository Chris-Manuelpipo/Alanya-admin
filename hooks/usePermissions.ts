"use client";

import { useCallback } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";

/**
 * Ce que le compte connecté a le droit de faire.
 *
 * La liste vient du serveur (`GET /admin/me`), jamais du `localStorage` : une
 * session ouverte avant un changement de rôle y garderait une valeur périmée et
 * afficherait des boutons morts. Elle n'est pas non plus recalculée ici — une
 * copie de la table des rôles divergerait au premier oubli.
 *
 * Tant que le profil charge, `can()` répond faux : mieux vaut une action qui
 * apparaît une seconde trop tard qu'un bouton qui s'affiche puis disparaît.
 */
export function usePermissions() {
  const { data, isLoading } = useAdminProfile();
  const permissions = data?.permissions;

  const can = useCallback(
    (permission: string) => permissions?.includes(permission) ?? false,
    [permissions],
  );

  return { can, isLoading, permissions: permissions ?? [] };
}
