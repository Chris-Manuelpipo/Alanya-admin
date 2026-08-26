"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { closeAdminSocket, getAdminSocket } from "@/lib/socket";

interface TripAlert {
  state: "alert" | "sos";
  kind: "taxi" | "walk" | "sos";
  at: string;
}

/**
 * Deux notes brèves. Pas de fichier son à embarquer, et rien à télécharger :
 * une alerte doit pouvoir sonner sur un poste hors ligne.
 *
 * Le navigateur refuse le son tant que la page n'a reçu aucun geste — c'est
 * attendu, et sans conséquence : le bandeau, lui, s'affiche toujours.
 */
function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.18].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 880 : 660;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.16);
    });
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    // Un son refusé ne doit jamais empêcher l'alerte de s'afficher.
  }
}

const KIND_LABEL: Record<string, string> = {
  taxi: "trajet en taxi",
  walk: "trajet à pied",
  sos: "SOS",
};

/**
 * Bandeau d'alerte des trajets.
 *
 * Ce que l'alerte dit, et ce qu'elle ne dit pas : le serveur n'envoie ni
 * identité, ni position, ni identifiant de trajet — la règle qui gouverne la
 * page Trajets vaut aussi pour ce canal. Le bandeau annonce donc qu'une alerte
 * s'est ouverte, pas laquelle.
 *
 * Il ne se ferme que sur une action explicite : une alerte qui disparaît toute
 * seule au changement de page est une alerte manquée.
 */
export function AdminAlerts() {
  const router = useRouter();
  const { can } = usePermissions();
  const [alerts, setAlerts] = useState<TripAlert[]>([]);
  const autorise = can("trips.read");
  const previous = useRef(0);

  useEffect(() => {
    if (!autorise) return;
    const socket = getAdminSocket();
    if (!socket) return;

    const onAlert = (payload: TripAlert) => setAlerts((a) => [payload, ...a].slice(0, 20));
    socket.on("admin:trip_alert", onAlert);
    return () => {
      socket.off("admin:trip_alert", onAlert);
    };
  }, [autorise]);

  // Le son suit l'arrivée, pas le rendu : sonner dans le gestionnaire d'événement
  // le ferait aussi retentir sur un re-rendu sans nouvelle alerte.
  useEffect(() => {
    if (alerts.length > previous.current) beep();
    previous.current = alerts.length;
  }, [alerts.length]);

  // Fermer la session ferme le canal : sans ça, un socket authentifié
  // survivrait à la déconnexion jusqu'au rechargement de l'onglet.
  useEffect(() => () => closeAdminSocket(), []);

  if (!autorise || alerts.length === 0) return null;

  const dernier = alerts[0];
  const sos = alerts.some((a) => a.state === "sos");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={
        sos
          ? "flex flex-wrap items-center gap-3 border-b border-red-200 bg-red-50 px-6 py-3 dark:border-red-900/60 dark:bg-red-950/40"
          : "flex flex-wrap items-center gap-3 border-b border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-800/60 dark:bg-amber-950/40"
      }
    >
      <AlertTriangle
        className={sos ? "h-5 w-5 shrink-0 text-red-600 dark:text-red-400" : "h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"}
      />
      <div className="min-w-0 flex-1">
        <p className={sos ? "text-sm font-semibold text-red-700 dark:text-red-300" : "text-sm font-semibold text-amber-700 dark:text-amber-300"}>
          {alerts.length === 1
            ? `Une alerte de trajet vient de s'ouvrir — ${KIND_LABEL[dernier.kind] ?? dernier.kind}`
            : `${alerts.length} alertes de trajet depuis l'ouverture de cette page`}
        </p>
        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          Compteur agrégé : ce canal ne transporte ni identité, ni position, ni
          identifiant de trajet.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => router.push("/trips")}>
        Voir les trajets
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Masquer les alertes"
        onClick={() => setAlerts([])}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
