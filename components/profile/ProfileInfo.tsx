"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Shield, MapPin, Calendar, Clock } from "lucide-react";
import type { AdminProfile } from "@/types";

const roleLabels: Record<number, string> = {
  0: "Utilisateur",
  1: "Admin",
  2: "Super-Admin",
};

interface ProfileInfoProps {
  profile: AdminProfile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const rows = [
    { icon: User, label: "Nom", value: profile.nom },
    { icon: User, label: "Pseudo", value: `@${profile.pseudo}` },
    { icon: Mail, label: "Email", value: profile.email || "Non renseigné" },
    { icon: Phone, label: "Téléphone", value: profile.alanyaPhone || "Non renseigné" },
    { icon: Shield, label: "Rôle", value: roleLabels[profile.typeCompte] || "Inconnu" },
    { icon: MapPin, label: "Pays", value: profile.paysLibelle || "Non renseigné" },
    { icon: Calendar, label: "Inscrit le", value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—" },
    { icon: Clock, label: "Dernière connexion", value: profile.lastSeen ? new Date(profile.lastSeen).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—" },
  ];

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                <row.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.label}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
