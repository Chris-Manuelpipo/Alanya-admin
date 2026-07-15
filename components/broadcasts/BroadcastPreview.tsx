import { Badge } from "@/components/ui/badge";
import { Megaphone, Image, Video, FileText, Radio } from "lucide-react";

interface BroadcastPreviewProps {
  content: string;
  type: number;
  mediaUrl?: string;
  targetType: string;
  isStatus?: boolean;
}

const typeLabels: Record<number, { label: string; icon: React.ElementType }> = {
  0: { label: "Texte", icon: FileText },
  1: { label: "Image", icon: Image },
  2: { label: "Vidéo", icon: Video },
};

const targetLabels: Record<string, string> = {
  all: "Tous les utilisateurs",
  country: "Par pays",
  specific: "Utilisateurs spécifiques",
};

export function BroadcastPreview({ content, type, mediaUrl, targetType, isStatus }: BroadcastPreviewProps) {
  const typeInfo = typeLabels[type] || typeLabels[0];
  const TypeIcon = typeInfo.icon;

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${
      isStatus
        ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/30"
        : "border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/30"
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-2 text-xs ${
        isStatus ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"
      }`}>
        {isStatus ? <Radio className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
        <span className="font-medium">{isStatus ? "Aperçu du statut" : "Aperçu du broadcast"}</span>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-black/5 dark:border-white/10 shadow-sm">
        <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">{content}</p>
        {mediaUrl && (
          <div className="mt-2 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-700">
            <img src={mediaUrl} alt="Média" className="w-full h-32 object-cover" />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className={`text-xs gap-1 ${
          isStatus ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : ""
        }`}>
          {isStatus ? <Radio className="h-3 w-3" /> : <TypeIcon className="h-3 w-3" />}
          {isStatus ? "Statut" : typeInfo.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {targetLabels[targetType]}
        </Badge>
      </div>
    </div>
  );
}
