"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import type { AdminProfile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useAdminProfile();
  const [localProfile, setLocalProfile] = useState<AdminProfile | null>(null);

  const displayProfile = localProfile || profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-500" />
            Mon profil
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gérez vos informations personnelles
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement du profil</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && displayProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Profile card */}
          <div>
            <ProfileCard profile={displayProfile} />
          </div>

          {/* Right column — Info + Edit + Password */}
          <div className="lg:col-span-2 space-y-4">
            <ProfileInfo profile={displayProfile} />
            <ProfileEditForm
              profile={displayProfile}
              onProfileUpdate={(updated) => setLocalProfile(updated)}
            />
            <PasswordChangeForm />
          </div>
        </div>
      )}
    </div>
  );
}
