"use client";

import { useMeetings, useEndMeeting, useDeleteMeeting } from "@/hooks/useMeetings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { RefreshCw, Video, Phone, Clock, Calendar, Users, Trash2, XCircle, SlidersHorizontal, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FilterBar, FilterDef } from "@/components/dashboard/FilterBar";

const MEETING_FILTERS: FilterDef[] = [
  { key: "status", label: "Statut", options: [
    { value: "", label: "Tous" },
    { value: "ongoing", label: "En cours" },
    { value: "ended", label: "Terminées" },
  ] },
  { key: "type", label: "Type", options: [
    { value: "", label: "Tous" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Vidéo" },
  ] },
  { key: "sort", label: "Trier par", options: [
    { value: "startTime", label: "Date" },
    { value: "duree", label: "Durée" },
    { value: "participants", label: "Participants" },
  ] },
  { key: "order", label: "Ordre", options: [
    { value: "desc", label: "Décroissant" },
    { value: "asc", label: "Croissant" },
  ] },
];
const MEETING_DEFAULTS = { status: "", type: "", sort: "startTime", order: "desc" };

export default function MeetingsPage() {
  const { data: meetings, isLoading, isError, refetch } = useMeetings();
  const endMutation = useEndMeeting();
  const deleteMutation = useDeleteMeeting();
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(MEETING_DEFAULTS);

  const filtered = useMemo(() => {
    if (!meetings) return [];
    const q = search.trim().toLowerCase();
    const list = meetings.filter((m) => {
      if (q && !`${m.objet} ${m.organiserNom} ${m.organiserPseudo}`.toLowerCase().includes(q)) return false;
      if (values.status === "ongoing" && m.isEnd !== 0) return false;
      if (values.status === "ended" && m.isEnd !== 1) return false;
      if (values.type === "audio" && m.typeMedia !== 0) return false;
      if (values.type === "video" && m.typeMedia !== 1) return false;
      return true;
    });
    const dir = values.order === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (values.sort) {
        case "duree": return dir * ((a.duree || 0) - (b.duree || 0));
        case "participants": return dir * ((a.participants || 0) - (b.participants || 0));
        case "startTime":
        default: return dir * (new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime());
      }
    });
  }, [meetings, search, values]);

  function handleEnd(id: number) {
    endMutation.mutate(id, {
      onSuccess: () => addToast({ title: "Réunion terminée", variant: "success" }),
      onError: () => addToast({ title: "Échec", description: "Impossible de terminer la réunion", variant: "error" }),
    });
  }

  function handleDelete() {
    if (!confirmDelete) return;
    deleteMutation.mutate(confirmDelete, {
      onSuccess: () => {
        addToast({ title: "Réunion supprimée", variant: "success" });
        setConfirmDelete(null);
      },
      onError: () => {
        addToast({ title: "Échec", description: "Impossible de supprimer la réunion", variant: "error" });
        setConfirmDelete(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Réunions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestion des réunions audio et vidéo ({filtered.length}{meetings ? ` / ${meetings.length}` : ""} réunions)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters((s) => !s)} className={showFilters ? "bg-indigo-50 dark:bg-indigo-950" : ""}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtres
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par objet ou organisateur..."
        showFilters={showFilters}
        filters={MEETING_FILTERS}
        values={values}
        defaults={MEETING_DEFAULTS}
        onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
        onReset={() => setValues(MEETING_DEFAULTS)}
      />

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {meetings && meetings.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Video className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          Aucune réunion
        </div>
      )}

      {meetings && meetings.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400 text-sm">
          <Search className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
          Aucune réunion trouvée
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((meeting) => (
            <Card key={meeting.idMeeting} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${meeting.typeMedia === 1 ? "bg-amber-100 dark:bg-amber-950" : "bg-violet-100 dark:bg-violet-950"}`}>
                    {meeting.typeMedia === 1
                      ? <Video className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      : <Phone className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold truncate">{meeting.objet}</h3>
                        {meeting.isEnd === 0 && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 text-xs shrink-0">En cours</Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {meeting.isEnd === 0 && (
                          <button onClick={() => handleEnd(meeting.idMeeting)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded" title="Terminer">
                            <XCircle className="h-4 w-4 text-amber-500" />
                          </button>
                        )}
                        <button onClick={() => setConfirmDelete(meeting.idMeeting)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded" title="Supprimer">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-5 w-5"><AvatarImage src={meeting.organiserAvatar} /><AvatarFallback className="text-[10px]">{meeting.organiserNom?.charAt(0)}</AvatarFallback></Avatar>
                        {meeting.organiserNom}
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(meeting.startTime).toLocaleDateString("fr")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{meeting.duree} min</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meeting.participants} participants</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Salle : {meeting.room}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la réunion</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
