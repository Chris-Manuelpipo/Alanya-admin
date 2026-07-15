"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck } from "lucide-react";
import type { AdminProfile } from "@/types";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const roleLabels: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  0: { label: "Utilisateur", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", icon: Shield },
  1: { label: "Admin", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300", icon: ShieldCheck },
  2: { label: "Super-Admin", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", icon: ShieldCheck },
};

interface ProfileCardProps {
  profile: AdminProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const role = roleLabels[profile.typeCompte] || roleLabels[0];
  const RoleIcon = role.icon;

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profile.avatarUrl || undefined} alt={profile.nom} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            {getInitials(profile.nom)}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{profile.nom}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">@{profile.pseudo}</p>

        <Badge className={`mt-3 ${role.color} border-0`}>
          <RoleIcon className="h-3 w-3 mr-1" />
          {role.label}
        </Badge>

        {profile.email && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">{profile.email}</p>
        )}
      </CardContent>
    </Card>
  );
}
