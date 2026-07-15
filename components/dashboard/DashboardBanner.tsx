"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Megaphone, Clock } from "lucide-react";

interface DashboardBannerProps {
  adminName?: string;
  onlineUsers?: number;
  messagesToday?: number;
}

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
      {time}
    </span>
  );
}

function DateDisplay() {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const update = () => {
      setDateStr(
        new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">{dateStr}</span>;
}

export function DashboardBanner({ adminName, onlineUsers = 0 }: DashboardBannerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const displayName = adminName?.split(" ")[0] || "Admin";

  return (
    <div
      className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 shadow-sm overflow-hidden animate-[fadeSlideIn_0.5s_ease-out] banner-shimmer-border"
    >
      {/* Glow */}
      <div
        className="absolute -top-24 -right-16 w-80 h-80 pointer-events-none opacity-70 dark:opacity-100 animate-banner-glow"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,.15), rgba(168,85,247,.08) 40%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-6 flex-wrap sm:flex-nowrap">
        {/* Left: Greeting + Actions */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Greeting + Actions */}
          <div className="min-w-0 flex-1">
            <div
              className="animate-[fadeSlideIn_0.4s_ease-out_both]"
              style={{ animationDelay: "150ms" }}
            >
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Bonsoir, <span className="text-indigo-600 dark:text-indigo-400">{displayName}</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Résumé de l&apos;activité Alanya aujourd&apos;hui
              </p>
            </div>

            {/* Actions row */}
            <div
              className="flex items-center gap-2 mt-3 flex-wrap animate-[fadeSlideIn_0.4s_ease-out_both]"
              style={{ animationDelay: "250ms" }}
            >
              {/* Search */}
              <div className="relative flex items-center gap-2 flex-1 max-w-xs">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Recherche rapide…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/users?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40 transition-shadow"
                />
              </div>

              {/* Live pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {onlineUsers} en ligne
                </span>
              </div>

              {/* Annoncer */}
              <button
                onClick={() => router.push("/broadcasts")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-indigo-600 hover:to-violet-600 transition-all duration-200"
              >
                <Megaphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Diffuser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clock */}
        <div
          className="shrink-0 flex flex-col items-end gap-0.5 animate-[fadeSlideIn_0.4s_ease-out_both]"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <LiveClock />
          </div>
          <DateDisplay />
        </div>
      </div>
    </div>
  );
}
