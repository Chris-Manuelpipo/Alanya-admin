"use client";

import { useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { TopCountries } from "@/components/dashboard/TopCountries";
import { TopUsersTable } from "@/components/dashboard/TopUsersTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useStats, useActivityFeed } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

import {
  Users,
  Activity,
  Ban,
  MessageSquare,
  Phone,
  Smile,
  RefreshCw,
} from "lucide-react";

function subDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r.toISOString().split("T")[0];
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("7");
  const to = new Date().toISOString().split("T")[0];
  const from = useMemo(() => subDays(new Date(), parseInt(period)), [period]);

  const { data: stats, isLoading, isError, refetch } = useStats(from, to);
  const { data: activity, isLoading: activityLoading } = useActivityFeed();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Vue d&apos;ensemble de l&apos;activité Talky
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex h-10 w-32 items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="7">7 jours</option>
            <option value="30">30 jours</option>
            <option value="90">90 jours</option>
          </select>
          <Button variant="outline" size="icon" onClick={() => refetch()} className="shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Utilisateurs"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="#6366f1"
          subtitle="total"
        />
        <StatCard
          title="En ligne"
          value={stats?.onlineUsers ?? 0}
          icon={Activity}
          color="#22c55e"
          subtitle="maintenant"
          trend={stats ? { value: 12, positive: true } : undefined}
        />
        <StatCard
          title="Bannis"
          value={stats?.bannedUsers ?? 0}
          icon={Ban}
          color="#ef4444"
          subtitle="total"
        />
        <StatCard
          title="Messages"
          value={stats?.messagesPeriod ?? 0}
          icon={MessageSquare}
          color="#3b82f6"
          subtitle="cette période"
        />
        <StatCard
          title="Appels"
          value={stats?.callsPeriod ?? 0}
          icon={Phone}
          color="#8b5cf6"
          subtitle="cette période"
        />
        <StatCard
          title="Statuts"
          value={stats?.statusesPeriod ?? 0}
          icon={Smile}
          color="#f59e0b"
          subtitle="cette période"
        />
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="text-center py-12 text-zinc-400 text-sm">Chargement des données...</div>
      )}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {stats && (
        <>
          {/* Charts + Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AreaChart data={stats.registrations} title="Inscriptions par jour" />
            </div>
            <TopCountries data={stats.topCountries} />
          </div>

          {/* Users + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TopUsersTable data={stats.topUsers} />
            </div>
            <ActivityFeed data={activity} isLoading={activityLoading} />
          </div>
        </>
      )}
    </div>
  );
}
