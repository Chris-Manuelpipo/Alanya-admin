"use client";

import { useMemo } from "react";
import { Sun, Moon, CloudSun, Coffee, Sparkles } from "lucide-react";

interface DashboardBannerProps {
  adminName?: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8)
    return { text: "Bon matin", icon: Coffee, emoji: "☀️", accent: "from-amber-500 to-orange-400" };
  if (hour >= 8 && hour < 12)
    return { text: "Bonjour", icon: Sun, emoji: "🌤️", accent: "from-amber-400 to-yellow-400" };
  if (hour >= 12 && hour < 14)
    return { text: "Bon midi", icon: CloudSun, emoji: "🍽️", accent: "from-orange-400 to-amber-400" };
  if (hour >= 14 && hour < 18)
    return { text: "Bon après-midi", icon: Sun, emoji: "☀️", accent: "from-indigo-400 to-violet-400" };
  if (hour >= 18 && hour < 21)
    return { text: "Bonsoir", icon: Moon, emoji: "🌅", accent: "from-violet-400 to-indigo-500" };
  return { text: "Bonne nuit", icon: Moon, emoji: "🌙", accent: "from-indigo-500 to-blue-500" };
}

export function DashboardBanner({ adminName }: DashboardBannerProps) {
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
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${greeting.accent} p-[1px]`}
    >
      <div className="relative rounded-[15px] bg-white dark:bg-zinc-900 px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="shrink-0">
              <img
                src="/admin/logo.png"
                alt="Alanya"
                width={56}
                height={56}
                className="rounded-xl shadow-md object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {greeting.text}, {displayName}
                </h1>
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 capitalize">
                {dateStr}
              </p>
            </div>
          </div>

          <div className="shrink-0 hidden sm:block">
            <div className="text-4xl">{greeting.emoji}</div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tl from-white/10 to-transparent blur-2xl" />
      </div>
    </div>
  );
}
