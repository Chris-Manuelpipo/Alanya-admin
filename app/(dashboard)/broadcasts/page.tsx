"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BroadcastDialog } from "@/components/broadcasts/BroadcastDialog";
import { BroadcastHistory } from "@/components/broadcasts/BroadcastHistory";
import { Megaphone } from "lucide-react";

export default function BroadcastsPage() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diffusions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Composer une diffusion et savoir qui la recevra
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-sm"
        >
          <Megaphone className="h-4 w-4 mr-2" />
          Nouvelle diffusion
        </Button>
      </div>

      <BroadcastHistory />
      <BroadcastDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
