"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UsersRound,
  Video,
  Image,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { isAuthenticated, adminLogout, getAdminUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/meetings", label: "Meetings", icon: Video },
  { href: "/medias", label: "Medias", icon: Image },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setAuthenticated(auth);
    setReady(true);
    if (!auth && !USE_MOCK) {
      router.replace('/login');
    }
  }, [router]);

  if (!ready) return null;

  if (!authenticated && !USE_MOCK) {
    return null;
  }

  const user = getAdminUser();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-white dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b dark:border-zinc-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">Talky Admin</span>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t dark:border-zinc-800 p-2 space-y-1">
          {!collapsed && user && (
            <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {user.nom || user.email}
            </div>
          )}
          <button
            onClick={() => { adminLogout(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between h-16 px-6 border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
