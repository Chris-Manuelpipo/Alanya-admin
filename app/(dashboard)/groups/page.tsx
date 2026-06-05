"use client";

import { useGroups, useDeleteGroup } from "@/hooks/useGroups";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RefreshCw, Users, MessageSquare, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function GroupsPage() {
  const { data: groups, isLoading, isError, refetch } = useGroups();
  const { addToast } = useToast();
  const router = useRouter();
  const deleteGroup = useDeleteGroup();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function handleDelete(id: number) {
    deleteGroup.mutate(id, {
      onSuccess: () => {
        addToast({ title: "Groupe supprimé", description: `Groupe #${id}`, variant: "success" });
        setDeleteId(null);
      },
      onError: () => {
        addToast({ title: "Échec de la suppression", variant: "error" });
        setDeleteId(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groupes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestion des groupes de discussion ({groups?.length ?? 0} groupes)
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5"><Skeleton className="h-6 w-3/4 mb-3" /><Skeleton className="h-4 w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {groups && groups.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Users className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          Aucun groupe
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group.conversID}
              onClick={() => router.push(`/groups/${group.conversID}`)}
              className="border-0 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarImage src={group.groupPhoto} />
                    <AvatarFallback className="rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-lg">
                      {group.groupName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">{group.groupName}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteId(group.conversID); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{group.members} membres</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{group.lastMessage ? "Actif" : "Inactif"}</span>
                    </div>
                    {group.lastMessage && <p className="text-xs text-zinc-400 mt-2 truncate">{group.lastMessage}</p>}
                    <p className="text-xs text-zinc-400 mt-1">Créé le {group.createdAt ? new Date(group.createdAt).toLocaleDateString("fr") : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le groupe</DialogTitle>
            <DialogDescription>Tous les messages et participants seront perdus.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
