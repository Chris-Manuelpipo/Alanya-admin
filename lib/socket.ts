import { io, type Socket } from "socket.io-client";
import { getAdminToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://www.alanya237.com/api";

/** Le serveur socket écoute sur l'origine, pas sous `/api`. */
const ORIGIN = API_BASE.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

/**
 * Socket du back-office, en un exemplaire pour tout le panneau.
 *
 * `admin:login` est ré-émis à chaque `connect` et pas seulement au premier :
 * le serveur perd l'appartenance au salon quand la connexion tombe, et une
 * reconnexion silencieuse laisserait le panneau branché mais sourd.
 */
export function getAdminSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!getAdminToken()) return null;
  if (socket) return socket;

  socket = io(ORIGIN, { transports: ["websocket"], reconnection: true });
  socket.on("connect", () => {
    const token = getAdminToken();
    if (token) socket?.emit("admin:login", { token });
  });
  return socket;
}

export function closeAdminSocket() {
  socket?.close();
  socket = null;
}
