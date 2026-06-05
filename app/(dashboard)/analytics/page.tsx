"use client";

import { useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { PieChart } from "@/components/dashboard/PieChart";
import { StackedBarChart } from "@/components/dashboard/StackedBarChart";
import { HeatmapChart } from "@/components/dashboard/HeatmapChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Phone,
  Smile,
  UserPlus,
  Clock,
  CheckCircle2,
  Eye,
  Heart,
  Users,
  UsersRound,
  Video,
  RefreshCw,
} from "lucide-react";

function subDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r.toISOString().split("T")[0];
}

function formatDuration(s: number): string {
  if (!s) return "0s";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function trend(current: number, previous: number) {
  if (!previous) return undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: pct, positive: pct >= 0 };
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString("fr", { weekday: "short", day: "numeric" });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight pt-2">{children}</h2>;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7");
  const to = new Date().toISOString().split("T")[0];
  const from = useMemo(() => subDays(new Date(), parseInt(period)), [period]);

  const { data, isLoading, isError, refetch } = useAnalytics(from, to);

  const messagesTotal = useMemo(
    () => (data ? data.messagesByType.reduce((s, m) => s + m.count, 0) : 0),
    [data]
  );

  const messageTypePie = useMemo(
    () => (data ? data.messagesByType.map((m) => ({ name: m.label, value: m.count })) : []),
    [data]
  );
  const callTypePie = useMemo(
    () =>
      data
        ? [
            { name: "Audio", value: data.calls.audio },
            { name: "Vidéo", value: data.calls.video },
          ]
        : [],
    [data]
  );
  const callOutcomePie = useMemo(
    () =>
      data
        ? [
            { name: "Répondus", value: data.calls.answered },
            { name: "Manqués", value: data.calls.missed },
            { name: "Rejetés", value: data.calls.rejected },
          ]
        : [],
    [data]
  );
  const storyTypePie = useMemo(
    () => (data ? data.stories.byType.map((m) => ({ name: m.label, value: m.count })) : []),
    [data]
  );
  const rolePie = useMemo(
    () => (data ? data.users.byRole.map((r) => ({ name: r.label, value: r.count })) : []),
    [data]
  );
  const devicePie = useMemo(
    () => (data ? data.devices.map((d) => ({ name: d.os, value: d.count })) : []),
    [data]
  );
  const meetingPie = useMemo(
    () =>
      data
        ? [
            { name: "Acceptés", value: data.meetings.accepted },
            { name: "Refusés", value: data.meetings.declined },
            { name: "Sans réponse", value: data.meetings.invited },
          ]
        : [],
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Analyse détaillée de l&apos;activité Alanya
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

      {isLoading && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          Chargement des analytics...
        </div>
      )}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {data && (
        <>
          {/* KPI avec tendances réelles (vs période précédente) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Messages" value={messagesTotal} icon={MessageSquare} color="#3b82f6" subtitle="cette période" trend={trend(messagesTotal, data.comparison.messages)} />
            <StatCard title="Appels" value={data.calls.total} icon={Phone} color="#8b5cf6" subtitle="cette période" trend={trend(data.calls.total, data.comparison.calls)} />
            <StatCard title="Stories" value={data.stories.total} icon={Smile} color="#f59e0b" subtitle="cette période" trend={trend(data.stories.total, data.comparison.statuses)} />
            <StatCard title="Nouveaux utilisateurs" value={data.users.newUsers} icon={UserPlus} color="#22c55e" subtitle="cette période" trend={trend(data.users.newUsers, data.comparison.registrations)} />
          </div>

          {/* ── Messagerie ── */}
          <SectionTitle>Messagerie</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PieChart data={messageTypePie} title="Messages par type" />
            <div className="lg:col-span-2">
              <AreaChart data={data.messagesByDay} title="Messages par jour" color="#3b82f6" />
            </div>
          </div>
          <HeatmapChart data={data.heatmap} title="Heures de pointe (messages)" />

          {/* ── Appels ── */}
          <SectionTitle>Appels</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Taux de réussite" value={`${data.calls.successRate}%`} icon={CheckCircle2} color="#22c55e" subtitle={`${data.calls.answered.toLocaleString()} répondus`} />
            <StatCard title="Durée moyenne" value={formatDuration(data.calls.avgDuration)} icon={Clock} color="#8b5cf6" subtitle="par appel répondu" />
            <StatCard title="Appels manqués" value={data.calls.missed} icon={Phone} color="#ef4444" subtitle="non répondus" />
            <StatCard title="Durée totale" value={formatDuration(data.calls.totalDuration)} icon={Clock} color="#6366f1" subtitle="cumulée" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PieChart data={callTypePie} title="Audio vs Vidéo" />
            <PieChart data={callOutcomePie} title="Issue des appels" />
            <PieChart data={meetingPie} title="Réunions — participation" />
          </div>
          <StackedBarChart
            data={data.callsByDay}
            title="Appels par jour (audio / vidéo)"
            xKey="date"
            formatX={formatDay}
            series={[
              { key: "audio", label: "Audio", color: "#8b5cf6" },
              { key: "video", label: "Vidéo", color: "#6366f1" },
            ]}
          />

          {/* ── Stories ── */}
          <SectionTitle>Stories</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-2 gap-4 lg:col-span-2 content-start">
              <StatCard title="Stories publiées" value={data.stories.total} icon={Smile} color="#f59e0b" subtitle="cette période" />
              <StatCard title="Vues totales" value={data.stories.totalViews} icon={Eye} color="#3b82f6" subtitle={`${data.stories.avgViews} en moyenne`} />
              <StatCard title="Likes totaux" value={data.stories.totalLikes} icon={Heart} color="#ef4444" subtitle="cette période" />
              <StatCard title="Engagement" value={`${data.stories.engagementRate}%`} icon={Heart} color="#22c55e" subtitle="likes / vues" />
            </div>
            <PieChart data={storyTypePie} title="Stories par type" />
          </div>

          {/* ── Réunions ── */}
          <SectionTitle>Réunions</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Réunions" value={data.meetings.total} icon={Video} color="#6366f1" subtitle="cette période" />
            <StatCard title="Durée moyenne" value={formatDuration(data.meetings.avgDuration)} icon={Clock} color="#8b5cf6" subtitle="par réunion" />
            <StatCard title="Taux de présence" value={`${data.meetings.attendanceRate}%`} icon={CheckCircle2} color="#22c55e" subtitle={`${data.meetings.accepted.toLocaleString()} acceptés`} />
            <StatCard title="No-show" value={`${data.meetings.noShowRate}%`} icon={UsersRound} color="#ef4444" subtitle="refus / sans réponse" />
          </div>

          {/* ── Utilisateurs & conversations ── */}
          <SectionTitle>Utilisateurs &amp; conversations</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PieChart data={rolePie} title="Répartition par rôle" />
            <PieChart data={devicePie} title="Systèmes (connexions)" />
            <div className="grid grid-cols-2 gap-4 content-start">
              <StatCard title="Conversations" value={data.conversations.total} icon={MessageSquare} color="#3b82f6" subtitle="total" />
              <StatCard title="Groupes" value={data.conversations.groups} icon={UsersRound} color="#f59e0b" subtitle="actifs" />
              <StatCard title="Privées (1-1)" value={data.conversations.oneToOne} icon={Users} color="#6366f1" subtitle="total" />
              <StatCard title="Taille moy. groupe" value={data.conversations.avgGroupSize} icon={UsersRound} color="#22c55e" subtitle="membres" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
