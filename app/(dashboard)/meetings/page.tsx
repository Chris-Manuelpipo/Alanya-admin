"use client";

import { useMeetings } from "@/hooks/useMeetings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw, Video, Phone, Clock, Calendar, Users } from "lucide-react";

export default function MeetingsPage() {
  const { data: meetings, isLoading, isError, refetch } = useMeetings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Réunions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestion des réunions et appels vidéo ({meetings?.length ?? 0} réunions)
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      )}

      {meetings && (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Card key={meeting.idMeeting} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${meeting.typeMedia === 1 ? "bg-amber-100 dark:bg-amber-950" : "bg-violet-100 dark:bg-violet-950"}`}>
                    {meeting.typeMedia === 1
                      ? <Video className={`h-6 w-6 ${meeting.typeMedia === 1 ? "text-amber-600 dark:text-amber-400" : "text-violet-600 dark:text-violet-400"}`} />
                      : <Phone className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{meeting.objet}</h3>
                      {meeting.isEnd === 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 text-xs shrink-0">
                          En cours
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={meeting.organiserAvatar} />
                          <AvatarFallback className="text-[10px]">{meeting.organiserNom?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {meeting.organiserNom}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(meeting.startTime).toLocaleDateString("fr")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {meeting.duree} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {meeting.participants} participants
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Salle : {meeting.room}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
