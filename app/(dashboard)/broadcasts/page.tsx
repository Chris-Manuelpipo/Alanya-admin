"use client";

import Link from "next/link";
import { BroadcastHistory } from "@/components/broadcasts/BroadcastHistory";
import { Megaphone } from "lucide-react";

export default function BroadcastsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diffusions</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Composer une diffusion et savoir qui la recevra
          </p>
        </div>
        <Link
          href="/broadcasts/new"
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-600 hover:to-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Megaphone className="h-4 w-4" />
          Nouvelle diffusion
        </Link>
      </div>

      <BroadcastHistory />
    </div>
  );
}
