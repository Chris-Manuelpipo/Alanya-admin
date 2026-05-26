"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers, useBanUser, useUnbanUser, useSetUserRole, useDeleteUser } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [idPays, setIdPays] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const { data, isLoading } = useUsers({ search, status, page, limit: 20, idPays, sort, order });

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const roleMutation = useSetUserRole();
  const deleteMutation = useDeleteUser();

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmBan, setConfirmBan] = useState<{ id: number; reason: string } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ id: number; role: number } | null>(null);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestion des utilisateurs Talky ({data?.total ?? 0} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? "bg-indigo-50 dark:bg-indigo-950" : ""}>
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Rechercher par nom, pseudo ou téléphone..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-white dark:bg-zinc-900">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Statut</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Pays</label>
              <select value={idPays} onChange={(e) => { setIdPays(e.target.value); setPage(1); }} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Tous</option>
                <option value="1">France</option>
                <option value="2">Côte d&apos;Ivoire</option>
                <option value="3">Cameroun</option>
                <option value="4">Sénégal</option>
                <option value="5">Maroc</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Trier par</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="created_at">Date d&apos;inscription</option>
                <option value="nom">Nom</option>
                <option value="last_seen">Dernière activité</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Ordre</label>
              <select value={order} onChange={(e) => setOrder(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Téléphone</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Inscrit le</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))}
              {data?.items.map((user) => (
                <tr key={user.alanyaID} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{user.alanyaID}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/users/${user.alanyaID}`)} className="font-medium hover:text-indigo-600 transition-colors text-left">
                      {user.nom}
                    </button>
                    <div className="text-xs text-zinc-400">@{user.pseudo}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{user.alanyaPhone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.typeCompte]}`}>
                      {roleLabels[user.typeCompte]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionsMenu user={user} onView={() => router.push(`/users/${user.alanyaID}`)} onBan={() => setConfirmBan({ id: user.alanyaID, reason: "" })} onUnban={() => unbanMutation.mutate(user.alanyaID)} onRoleUp={() => setConfirmRole({ id: user.alanyaID, role: Math.min(user.typeCompte + 1, 2) })} onRoleDown={() => setConfirmRole({ id: user.alanyaID, role: Math.max(user.typeCompte - 1, 0) })} onDelete={() => setConfirmDelete(user.alanyaID)} />
                  </td>
                </tr>
              ))}
              {!isLoading && data?.items.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-400 text-sm">Aucun utilisateur trouvé</td></tr>
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
            </Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / data.limit)} onClick={() => setPage(p => p + 1)}>
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Ban Dialog */}
      <Dialog open={!!confirmBan} onOpenChange={() => setConfirmBan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l&apos;utilisateur</DialogTitle>
            <DialogDescription>Cette action désactivera le compte de l&apos;utilisateur.</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <label className="text-sm font-medium mb-1 block">Raison (optionnelle)</label>
            <Input value={confirmBan?.reason || ""} onChange={(e) => setConfirmBan(prev => prev ? { ...prev, reason: e.target.value } : null)} placeholder="Spam, comportement inapproprié..." />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (confirmBan) { banMutation.mutate({ id: confirmBan.id, reason: confirmBan.reason }); setConfirmBan(null); } }}>
              {banMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Bannir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Role Dialog */}
      <Dialog open={!!confirmRole} onOpenChange={() => setConfirmRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>Passer au rôle : {confirmRole ? roleLabels[confirmRole.role] : ""}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={() => { if (confirmRole) { roleMutation.mutate({ id: confirmRole.id, typeCompte: confirmRole.role }); setConfirmRole(null); } }}>
              {roleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;utilisateur</DialogTitle>
            <DialogDescription>Cette action est irréversible. Toutes les données de l&apos;utilisateur seront supprimées.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (confirmDelete) { deleteMutation.mutate(confirmDelete); setConfirmDelete(null); } }}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Supprimer
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

function ActionsMenu({ user, onView, onBan, onUnban, onRoleUp, onRoleDown, onDelete }: {
  user: { alanyaID: number; typeCompte: number; exclus: boolean };
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
          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border bg-white dark:bg-zinc-900 shadow-lg py-1 text-sm">
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
            {user.typeCompte < 2 && (
              <button onClick={() => { onRoleUp(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <Shield className="h-4 w-4" /> Promouvoir
              </button>
            )}
            {user.typeCompte > 0 && (
              <button onClick={() => { onRoleDown(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left">
                <ShieldOff className="h-4 w-4" /> Rétrograder
              </button>
            )}
            <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
            <button onClick={() => { onDelete(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/50 text-left text-red-600">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
