"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUsers, useBanUser, useUnbanUser, useSetUserRole, useDeleteUser } from "@/hooks/useUsers";
import { useIsSuperAdmin } from "@/hooks/useAdminUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Ban,
  CheckCircle2,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const roleLabels: Record<number, string> = { 0: "User", 1: "Admin", 2: "Super Admin" };
const roleColors: Record<number, string> = { 0: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", 1: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300", 2: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };
const statusOptions = [
  { value: "", label: "Tous" },
  { value: "online", label: "En ligne" },
  { value: "banned", label: "Bannis" },
  { value: "admin", label: "Admins" },
];

export default function UsersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const isSuper = useIsSuperAdmin();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [idPays, setIdPays] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { data, isLoading } = useUsers({ search, status, page, limit: 20, idPays, sort, order });
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const roleMutation = useSetUserRole();
  const deleteMutation = useDeleteUser();

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmBan, setConfirmBan] = useState<{ id: number; reason: string } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ id: number; role: number } | null>(null);
  const [confirmBulkBan, setConfirmBulkBan] = useState(false);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
    setSelected(new Set());
  }

  const toggleSelect = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!data) return;
    if (selected.size === data.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map((u) => u.alanyaID)));
    }
  }, [data, selected]);

  function exportCSV() {
    if (!data) return;
    const headers = ["ID", "Nom", "Pseudo", "Email", "Téléphone", "Rôle", "Statut", "Pays", "Inscrit le"];
    const rows = data.items.map((u) => [
      u.alanyaID,
      u.nom,
      u.pseudo,
      u.email,
      u.alanyaPhone,
      roleLabels[u.typeCompte],
      u.exclus ? "Banni" : u.isOnline ? "En ligne" : "Hors ligne",
      u.paysLibelle || "",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr") : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `talky_users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast({ title: "Exporté", description: `${data.items.length} utilisateurs`, variant: "success" });
  }

  async function handleBulkBan() {
    setConfirmBulkBan(false);
    for (const id of Array.from(selected)) {
      await banMutation.mutateAsync({ id });
    }
    addToast({ title: `${selected.size} utilisateur(s) banni(s)`, variant: "success" });
    setSelected(new Set());
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestion des utilisateurs Alanya ({data?.total ?? 0} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? "bg-indigo-50 dark:bg-indigo-950" : ""}>
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder="Rechercher par nom, pseudo ou téléphone..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border bg-white dark:bg-zinc-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Filtres</span>
            <button
              onClick={() => { setStatus(""); setIdPays(""); setSort("created_at"); setOrder("desc"); setPage(1); }}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Réinitialiser
            </button>
          </div>
          <div className="flex flex-wrap gap-4 p-4">
            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-xs font-medium text-zinc-500">Statut</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-xs font-medium text-zinc-500">Pays</label>
              <select value={idPays} onChange={(e) => { setIdPays(e.target.value); setPage(1); }} className="flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <option value="">Tous</option>
                <option value="1">France</option>
                <option value="2">Côte d&apos;Ivoire</option>
                <option value="3">Cameroun</option>
                <option value="4">Sénégal</option>
                <option value="5">Maroc</option>
              </select>
            </div>
            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-xs font-medium text-zinc-500">Trier par</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <option value="created_at">Date d&apos;inscription</option>
                <option value="nom">Nom</option>
                <option value="last_seen">Dernière activité</option>
              </select>
            </div>
            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-xs font-medium text-zinc-500">Ordre</label>
              <select value={order} onChange={(e) => setOrder(e.target.value)} className="flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {(status || idPays || sort !== "created_at" || order !== "desc") && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {status && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              {statusOptions.find(o => o.value === status)?.label}
              <button onClick={() => { setStatus(""); setPage(1); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {idPays && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              {idPays === "1" ? "France" : idPays === "2" ? "Côte d'Ivoire" : idPays === "3" ? "Cameroun" : idPays === "4" ? "Sénégal" : idPays === "5" ? "Maroc" : idPays}
              <button onClick={() => { setIdPays(""); setPage(1); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sort !== "created_at" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              Tri: {sort === "nom" ? "Nom" : "Activité"}
              <button onClick={() => { setSort("created_at"); setPage(1); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {order !== "desc" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              Croissant
              <button onClick={() => { setOrder("desc"); setPage(1); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 animate-in fade-in">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selected.size} sélectionné(s)
          </span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => setConfirmBulkBan(true)} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              <Ban className="h-4 w-4 mr-1" /> Bannir
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="w-10 px-2 py-3">
                  <input type="checkbox" checked={data ? selected.size === data.items.length && data.items.length > 0 : false} onChange={toggleAll} className="rounded border-zinc-300" />
                </th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Nom</th>
                <th className="w-12 px-3 py-3"></th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Téléphone</th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Rôle</th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Statut</th>
                <th className="text-left px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Inscrit le</th>
                <th className="text-right px-3 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td className="px-2 py-3"><Skeleton className="h-5 w-5" /></td>
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="px-3 py-3"><Skeleton className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))}
              {data?.items.map((user) => (
                <tr key={user.alanyaID} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${selected.has(user.alanyaID) ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""}`}>
                  <td className="px-2 py-3">
                    <input type="checkbox" checked={selected.has(user.alanyaID)} onChange={() => toggleSelect(user.alanyaID)} className="rounded border-zinc-300" />
                  </td>
                  <td className="px-3 py-3 text-zinc-500 font-mono text-xs">{user.alanyaID}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => router.push(`/users/${user.alanyaID}`)} className="font-medium hover:text-indigo-600 transition-colors text-left">
                      {user.nom}
                    </button>
                    <div className="text-xs text-zinc-400">@{user.pseudo}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {user.nom?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-3 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-3 py-3 text-zinc-600 font-mono text-xs">{user.alanyaPhone}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.typeCompte]}`}>
                      {roleLabels[user.typeCompte]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {user.exclus ? (
                      <Badge variant="destructive" className="text-xs">Banni</Badge>
                    ) : user.isOnline ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 text-xs">En ligne</Badge>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {user.lastSeen ? `Vu ${timeAgo(user.lastSeen)}` : "Jamais"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr") : "-"}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <ActionsMenu canSuper={isSuper} user={user} onView={() => router.push(`/users/${user.alanyaID}`)} onBan={() => setConfirmBan({ id: user.alanyaID, reason: "" })} onUnban={() => { unbanMutation.mutate(user.alanyaID); addToast({ title: "Utilisateur débanni", variant: "success" }); }} onRoleUp={() => setConfirmRole({ id: user.alanyaID, role: Math.min(user.typeCompte + 1, 2) })} onRoleDown={() => setConfirmRole({ id: user.alanyaID, role: Math.max(user.typeCompte - 1, 0) })} onDelete={() => setConfirmDelete(user.alanyaID)} />
                  </td>
                </tr>
              ))}
              {!isLoading && data?.items.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-16 text-center">
                  <div className="text-zinc-300 dark:text-zinc-600 mb-2">
                    <Search className="h-10 w-10 mx-auto" />
                  </div>
                  <p className="text-zinc-400 text-sm">Aucun utilisateur trouvé</p>
                  <p className="text-xs text-zinc-400 mt-1">Essayez de modifier vos filtres ou votre recherche</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {data && data.total > data.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {data.page} sur {Math.ceil(data.total / data.limit)} ({data.total} résultats)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); setSelected(new Set()); }}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
            </Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / data.limit)} onClick={() => { setPage(p => p + 1); setSelected(new Set()); }}>
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={!!confirmBan} onOpenChange={() => setConfirmBan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l&apos;utilisateur</DialogTitle>
            <DialogDescription>Le compte sera désactivé et l&apos;utilisateur ne pourra plus se connecter.</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <label className="text-sm font-medium mb-1 block">Raison (optionnelle)</label>
            <Input value={confirmBan?.reason || ""} onChange={(e) => setConfirmBan(prev => prev ? { ...prev, reason: e.target.value } : null)} placeholder="Spam, comportement inapproprié..." />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (confirmBan) { banMutation.mutate({ id: confirmBan.id, reason: confirmBan.reason }); setConfirmBan(null); addToast({ title: "Utilisateur banni", variant: "success" }); } }}>
              {banMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Bannir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmRole} onOpenChange={() => setConfirmRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>Passer au rôle : <strong>{confirmRole ? roleLabels[confirmRole.role] : ""}</strong></DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={() => { if (confirmRole) { roleMutation.mutate({ id: confirmRole.id, typeCompte: confirmRole.role }); setConfirmRole(null); addToast({ title: "Rôle mis à jour", variant: "success" }); } }}>
              {roleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;utilisateur</DialogTitle>
            <DialogDescription>Cette action est irréversible. Toutes les données seront supprimées.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (confirmDelete) { deleteMutation.mutate(confirmDelete); setConfirmDelete(null); addToast({ title: "Utilisateur supprimé", variant: "success" }); } }}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBulkBan} onOpenChange={setConfirmBulkBan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir {selected.size} utilisateur(s)</DialogTitle>
            <DialogDescription>Cette action bannira tous les utilisateurs sélectionnés.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleBulkBan}>
              Bannir {selected.size} utilisateur(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return `il y a ${Math.floor(hrs / 24)}j`;
}

function ActionsMenu({ user, canSuper, onView, onBan, onUnban, onRoleUp, onRoleDown, onDelete }: {
  user: { alanyaID: number; typeCompte: number; exclus: boolean };
  canSuper: boolean;
  onView: () => void;
  onBan: () => void;
  onUnban: () => void;
  onRoleUp: () => void;
  onRoleDown: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border bg-white dark:bg-zinc-900 shadow-lg py-1 text-sm animate-in fade-in slide-in-from-top-1">
            <button onClick={() => { onView(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
              <Eye className="h-4 w-4" /> Détails
            </button>
            {user.exclus ? (
              <button onClick={() => { onUnban(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Débannir
              </button>
            ) : (
              <button onClick={() => { onBan(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-red-600">
                <Ban className="h-4 w-4" /> Bannir
              </button>
            )}
            {canSuper && user.typeCompte < 2 && (
              <button onClick={() => { onRoleUp(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <Shield className="h-4 w-4" /> Promouvoir
              </button>
            )}
            {canSuper && user.typeCompte > 0 && (
              <button onClick={() => { onRoleDown(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <ShieldOff className="h-4 w-4" /> Rétrograder
              </button>
            )}
            {canSuper && (
              <>
                <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                <button onClick={() => { onDelete(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/50 text-left text-red-600">
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
