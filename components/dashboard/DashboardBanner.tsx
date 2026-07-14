"use client";

import { useMemo, useState, useEffect } from "react";
import { Sun, Moon, CloudSun, Coffee, Sparkles, Clock, Zap, Users, MessageSquare } from "lucide-react";

interface DashboardBannerProps {
  adminName?: string;
  onlineUsers?: number;
  messagesToday?: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8)
    return {
      text: "Bon matin",
      sub: "Prêt pour une nouvelle journée ?",
      icon: Coffee,
      gradient: "from-amber-500 via-orange-400 to-amber-500",
      bg: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900",
      orb1: "bg-amber-300/40 dark:bg-amber-400/30",
      orb2: "bg-orange-300/30 dark:bg-orange-400/20",
    };
  if (hour >= 8 && hour < 12)
    return {
      text: "Bonjour",
      sub: "Que la productivité commence !",
      icon: Sun,
      gradient: "from-indigo-500 via-violet-500 to-indigo-500",
      bg: "bg-gradient-to-br from-indigo-50 via-violet-50/80 to-indigo-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900",
      orb1: "bg-violet-300/40 dark:bg-violet-400/30",
      orb2: "bg-indigo-300/30 dark:bg-indigo-400/20",
    };
  if (hour >= 12 && hour < 14)
    return {
      text: "Bon midi",
      sub: "N'oublie pas de prendre une pause",
      icon: CloudSun,
      gradient: "from-orange-500 via-amber-500 to-orange-500",
      bg: "bg-gradient-to-br from-orange-50 via-amber-50/80 to-orange-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900",
      orb1: "bg-orange-300/40 dark:bg-orange-400/30",
      orb2: "bg-amber-300/30 dark:bg-amber-400/20",
    };
  if (hour >= 14 && hour < 18)
    return {
      text: "Bon après-midi",
      sub: "Continue comme ça !",
      icon: Zap,
      gradient: "from-violet-500 via-purple-500 to-violet-500",
      bg: "bg-gradient-to-br from-violet-50 via-purple-50/80 to-violet-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900",
      orb1: "bg-purple-300/40 dark:bg-purple-400/30",
      orb2: "bg-violet-300/30 dark:bg-violet-400/20",
    };
  if (hour >= 18 && hour < 21)
    return {
      text: "Bonsoir",
      sub: "Belle journée de travail derrière toi",
      icon: Moon,
      gradient: "from-indigo-600 via-blue-500 to-indigo-600",
      bg: "bg-gradient-to-br from-blue-50 via-indigo-50/80 to-blue-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900",
      orb1: "bg-blue-300/40 dark:bg-blue-400/30",
      orb2: "bg-indigo-300/30 dark:bg-indigo-400/20",
    };
  return {
    text: "Bonne nuit",
    sub: "Pense à te reposer bien",
    icon: Moon,
    gradient: "from-slate-500 via-slate-400 to-slate-500",
    bg: "bg-gradient-to-br from-slate-50 via-slate-100/80 to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900",
    orb1: "bg-slate-300/40 dark:bg-slate-400/20",
    orb2: "bg-slate-200/30 dark:bg-slate-500/10",
  };
}

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-black/5 dark:border-white/10">
      <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-white/70" />
      <span className="text-sm font-mono font-medium text-zinc-700 dark:text-white/90 tabular-nums tracking-wider">
        {time}
      </span>
    </div>
  );
}

function StatPill({ icon: Icon, value, label, delay }: { icon: React.ElementType; value: number; label: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] backdrop-blur-sm border border-black/5 dark:border-white/[0.08] animate-[fadeSlideIn_0.4s_ease-out_both] shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
      <span className="text-sm font-semibold text-zinc-800 dark:text-white tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">{label}</span>
    </div>
  );
}

export function DashboardBanner({ adminName, onlineUsers = 0, messagesToday = 0 }: DashboardBannerProps) {
  const greeting = useMemo(() => getGreeting(), []);
  const Icon = greeting.icon;
  const displayName = adminName?.split(" ")[0] || "Admin";
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative rounded-2xl animate-[fadeSlideIn_0.5s_ease-out]">
      {/* Animated gradient border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_100%] animate-[borderShimmer_3s_linear_infinite] opacity-60 dark:opacity-40" />

      {/* Main container */}
      <div className={`relative overflow-hidden rounded-2xl ${greeting.bg}`}>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating orbs */}
        <div
          className={`absolute -top-16 -right-16 h-48 w-48 rounded-full ${greeting.orb1} blur-3xl animate-[float_6s_ease-in-out_infinite]`}
        />
        <div
          className={`absolute -bottom-12 -left-12 h-36 w-36 rounded-full ${greeting.orb2} blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]`}
        />

        {/* Content */}
        <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            {/* Left: Logo + Greeting */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className="relative shrink-0 animate-[fadeSlideIn_0.5s_ease-out_both]"
                style={{ animationDelay: "100ms" }}
              >
                <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${greeting.gradient} opacity-20 blur-md`} />
                <img
                  src="/admin/logo.png"
                  alt="Alanya"
                  width={60}
                  height={60}
                  className="relative rounded-xl shadow-lg object-contain bg-white dark:bg-zinc-800 p-1.5"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br ${greeting.gradient} shadow-md animate-[fadeSlideIn_0.4s_ease-out_both]`}
                    style={{ animationDelay: "200ms" }}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white animate-[fadeSlideIn_0.4s_ease-out_both]"
                    style={{ animationDelay: "250ms" }}
                  >
                    {greeting.text},{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                      {displayName}
                    </span>
                  </h1>
                  <Sparkles className="h-5 w-5 text-amber-400 shrink-0 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
                <p
                  className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 capitalize animate-[fadeSlideIn_0.4s_ease-out_both]"
                  style={{ animationDelay: "350ms" }}
                >
                  {greeting.sub}
                </p>
              </div>
            </div>

            {/* Right: Clock + Date + Stats */}
            <div className="shrink-0 flex flex-col items-end gap-2.5">
              <div className="flex items-center gap-2">
                <StatPill icon={Users} value={onlineUsers} label="en ligne" delay={400} />
                <StatPill icon={MessageSquare} value={messagesToday} label="messages" delay={500} />
              </div>
              <div className="flex items-center gap-3">
                <LiveClock />
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 capitalize">
                  {dateStr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
