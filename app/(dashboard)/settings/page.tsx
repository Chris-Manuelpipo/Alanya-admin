"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Globe, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const [appName, setAppName] = useState("Talky");
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://158.220.107.211/api");
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configuration de l&apos;application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Général</CardTitle>
            </div>
            <CardDescription>Paramètres généraux de l&apos;application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Nom de l&apos;application</Label>
              <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiUrl">URL de l&apos;API</Label>
              <Input id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Save className="h-4 w-4 mr-1" />
              {saved ? "Enregistré !" : "Enregistrer"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Apparence</CardTitle>
            </div>
            <CardDescription>Thème et personnalisation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500">Le thème (clair/sombre) se configure via le bouton en haut à droite.</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <Palette className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">Thème système</p>
                <p className="text-xs text-zinc-500">Suit les préférences de votre appareil</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Notifications</CardTitle>
            </div>
            <CardDescription>Configuration des notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">La gestion des notifications sera disponible dans une prochaine version.</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Maintenance</CardTitle>
            </div>
            <CardDescription>Mode maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500">Activer le mode maintenance pour bloquer l&apos;accès des utilisateurs.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMaintenance(!maintenance)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenance ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenance ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm">{maintenance ? "Activé" : "Désactivé"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
