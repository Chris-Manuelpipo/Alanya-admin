"use client";

import { useState } from "react";
import { useMediaItems } from "@/hooks/useMedias";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RefreshCw, Image, Video, FileText, Headphones, Search, Download, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MediaItem } from "@/types";

const mediaTypeLabels: Record<number, string> = { 1: "Image", 2: "Vidéo", 3: "Audio", 4: "Document" };
const mediaTypeColors: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  3: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  4: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};
const mediaTypeIcons: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  1: Image, 2: Video, 3: Headphones, 4: FileText,
};

export default function MediasPage() {
  const [filter, setFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const { data: mediaItems, isLoading, isError, refetch } = useMediaItems();
  const { addToast } = useToast();

  const filtered = (mediaItems || []).filter((m) => {
    if (filter !== null && m.type !== filter) return false;
    if (search && !m.mediaName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { label: "Tous", value: null, count: mediaItems?.length ?? 0 },
    { label: "Images", value: 1, count: mediaItems?.filter(m => m.type === 1).length ?? 0 },
    { label: "Vidéos", value: 2, count: mediaItems?.filter(m => m.type === 2).length ?? 0 },
    { label: "Audios", value: 3, count: mediaItems?.filter(m => m.type === 3).length ?? 0 },
    { label: "Documents", value: 4, count: mediaItems?.filter(m => m.type === 4).length ?? 0 },
  ];

  function handleDownload(media: MediaItem) {
    addToast({ title: "Téléchargement", description: media.mediaName, variant: "success" });
  }

  function handleDelete() {
    addToast({ title: "Média supprimé", variant: "success" });
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Médias</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Fichiers partagés sur Talky ({mediaItems?.length ?? 0} médias)
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input placeholder="Rechercher par nom de fichier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.value ?? "all"}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {mediaItems && mediaItems.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Image className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          Aucun média
        </div>
      )}

      {mediaItems && mediaItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((media) => {
            const Icon = mediaTypeIcons[media.type] || Image;
            const colorClass = mediaTypeColors[media.type] || mediaTypeColors[1];
            return (
              <Card key={media.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium truncate">{media.mediaName}</p>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setPreview(media)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                          </button>
                          <button onClick={() => handleDownload(media)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                            <Download className="h-3.5 w-3.5 text-zinc-500" />
                          </button>
                          <button onClick={() => setConfirmDelete(media.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded">
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">de {media.senderNom}</p>
                      <p className="text-xs text-zinc-400 truncate">#{media.conversationName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={`${colorClass} border-0 text-[10px] px-1.5 py-0`}>{mediaTypeLabels[media.type] || "Fichier"}</Badge>
                        <span className="text-[10px] text-zinc-400">{new Date(media.sendAt).toLocaleDateString("fr")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {mediaItems && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Search className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
          Aucun média trouvé
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{preview?.mediaName}</DialogTitle>
            <DialogDescription>
              {preview ? mediaTypeLabels[preview.type] : ""} · {preview?.senderNom} · #{preview?.conversationName}
            </DialogDescription>
          </DialogHeader>
          {preview?.type === 1 && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-64 flex items-center justify-center">
              <Image className="h-16 w-16 text-zinc-300" />
              <p className="text-xs text-zinc-400 ml-2">Aperçu non disponible</p>
            </div>
          )}
          {preview?.type === 2 && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-48 flex items-center justify-center">
              <Video className="h-12 w-12 text-zinc-300" />
            </div>
          )}
          {preview?.type === 3 && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-24 flex items-center justify-center">
              <Headphones className="h-8 w-8 text-zinc-300 mr-2" />
              <span className="text-sm text-zinc-500">Fichier audio</span>
            </div>
          )}
          {preview?.type === 4 && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-32 flex items-center justify-center">
              <FileText className="h-12 w-12 text-zinc-300 mr-2" />
              <span className="text-sm text-zinc-500">{preview.mediaName}</span>
            </div>
          )}
          <div className="text-xs text-zinc-400 space-y-1">
            <p>Fichier : {preview?.mediaName}</p>
            <p>Envoyé le : {preview ? new Date(preview.sendAt).toLocaleString("fr") : ""}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Fermer</Button></DialogClose>
            <Button onClick={() => preview && handleDownload(preview)}>
              <Download className="h-4 w-4 mr-1" /> Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le média</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete()}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
