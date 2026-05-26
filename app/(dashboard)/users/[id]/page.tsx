"use client";

import { useParams, useRouter } from "next/navigation";
import { useUserDetail, useUserActivity, useUserLogins } from "@/hooks/useUserDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Phone, Users, Smile, Calendar, Globe, Smartphone, Monitor, Clock, Shield, Mail, Ban as BanIcon } from "lucide-react";

const roleLabels: Record<number, string> = { 0: "Utilisateur", 1: "Admin", 2: "Super Admin" };

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data: user, isLoading: userLoading } = useUserDetail(id);
  const { data: activity, isLoading: activityLoading } = useUserActivity(id);
  const { data: logins, isLoading: loginsLoading } = useUserLogins(id);

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1"><Skeleton className="h-64 rounded-xl" /></div>
          <div className="lg:col-span-2"><Skeleton className="h-64 rounded-xl" /></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Utilisateur introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/users")}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.nom}</h1>
          <p className="text-sm text-zinc-500">@{user.pseudo} · {user.alanyaPhone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {user.nom?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.nom}</h2>
              <p className="text-sm text-zinc-500">@{user.pseudo}</p>
              <div className="mt-4 flex justify-center gap-2">
                <Badge className={user.isOnline ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 border-0"}>
                  {user.isOnline ? "En ligne" : "Hors ligne"}
                </Badge>
                {user.exclus && <Badge variant="destructive">Banni</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Mail} label={user.email} />
              <Row icon={Phone} label={user.alanyaPhone} />
              <Row icon={Globe} label={user.paysLibelle || "Inconnu"} />
              <Row icon={Shield} label={roleLabels[user.typeCompte] || "Inconnu"} />
              <Row icon={Calendar} label={`Inscrit le ${user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr") : "-"}`} />
              <Row icon={Clock} label={`Dernière activité : ${user.lastSeen ? new Date(user.lastSeen).toLocaleString("fr") : "-"}`} />
              {user.exclus && (
                <div className="flex items-start gap-3 text-red-600 pt-2 border-t">
                  <BanIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p>Banni le {user.excludeAt ? new Date(user.excludeAt).toLocaleDateString("fr") : "-"}</p>
                    {user.excludeReason && <p className="text-xs text-zinc-500 mt-1">Raison : {user.excludeReason}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity + Logins */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Activité</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
                </div>
              ) : activity ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <StatBox icon={MessageSquare} label="Messages" value={activity.messagesSent} color="#3b82f6" />
                  <StatBox icon={Users} label="Conversations" value={activity.conversations} color="#6366f1" />
                  <StatBox icon={Phone} label="Appels émis" value={activity.callsMade} color="#8b5cf6" />
                  <StatBox icon={Phone} label="Appels reçus" value={activity.callsReceived} color="#a855f7" />
                  <StatBox icon={Smile} label="Statuts" value={activity.statusesPublished} color="#f59e0b" />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Historique des connexions</CardTitle>
            </CardHeader>
            <CardContent>
              {loginsLoading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
              ) : (
                <div className="space-y-3">
                  {logins?.map((login) => (
                    <div key={login.idAccess} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 shrink-0">
                        {isMobile(login.os_system, login.device)
                          ? <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          : <Monitor className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{login.device}</p>
                        <p className="text-xs text-zinc-500">{login.os_system}</p>
                      </div>
                      <div className="text-right text-xs text-zinc-500 shrink-0">
                        <p>{new Date(login.dateLogin).toLocaleDateString("fr")}</p>
                        <p>{new Date(login.dateLogin).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  ))}
                  {(!logins || logins.length === 0) && (
                    <p className="text-center text-zinc-400 text-sm py-6">Aucune connexion enregistrée</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-zinc-400 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-center">
      <Icon className="h-5 w-5 mb-1" style={{ color }} />
      <p className="text-xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function isMobile(os: string, device: string): boolean {
  const s = `${os} ${device}`.toLowerCase();
  return s.includes("android") || s.includes("ios") || s.includes("iphone") || s.includes("samsung") || s.includes("pixel") || s.includes("mobile");
}
