"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  MessageSquare,
  MousePointerClick,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { RichTextArea } from "@/components/ui/rich-text-area";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { PreviewContent } from "@/components/preview/PreviewStage";
import type { PreviewLang } from "@/components/preview/types";
import { welcomeBlocksToMessages } from "@/lib/preview/welcome-blocks-to-messages";
import { cn } from "@/lib/utils";
import type { WelcomeBlock, WelcomeBlockType, WelcomeCtaButton } from "@/types";

const ROUTE_OPTIONS = [
  { value: "profile", label: "Profil" },
  { value: "statuses", label: "Statuts" },
  { value: "help", label: "Aide et FAQ" },
];

const BLOCK_META: Record<WelcomeBlockType, { label: string; Icon: typeof MessageSquare }> = {
  text: { label: "Texte", Icon: MessageSquare },
  image: { label: "Image", Icon: ImageIcon },
  video: { label: "Vidéo", Icon: Video },
  cta: { label: "Boutons", Icon: MousePointerClick },
};

function emptyBlock(type: WelcomeBlockType, sortOrder: number): WelcomeBlock {
  if (type === "cta") {
    return {
      sortOrder,
      blockType: "cta",
      ctaJson: {
        buttons: [
          { labelFr: "Compléter mon profil", labelEn: "Complete my profile", action: "route", target: "profile" },
        ],
      },
    };
  }
  return { sortOrder, blockType: type, contentFr: "", contentEn: "" };
}

interface WelcomeEditorProps {
  blocks: WelcomeBlock[];
  onChange: (blocks: WelcomeBlock[]) => void;
  disabled?: boolean;
  senderName?: string;
  senderAvatar?: string | null;
}

export function WelcomeEditor({
  blocks,
  onChange,
  disabled,
  senderName,
  senderAvatar,
}: WelcomeEditorProps) {
  const [lang, setLang] = useState<PreviewLang>("fr");
  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks],
  );

  // L'aperçu passe par la même transformation que le serveur : les blocs
  // deviennent des messages avant d'être rendus.
  const content = useMemo<PreviewContent>(
    () => ({
      mode: "chat",
      messages: welcomeBlocksToMessages(sorted, lang),
      senderName: senderName || "Alanya",
      senderAvatar,
      official: true,
      emptyLabel: "Ajoutez un bloc pour voir le message",
    }),
    [sorted, lang, senderName, senderAvatar],
  );

  function updateBlock(index: number, patch: Partial<WelcomeBlock>) {
    const next = sorted.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(next.map((b, i) => ({ ...b, sortOrder: i })));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next.map((b, i) => ({ ...b, sortOrder: i })));
  }

  function removeBlock(index: number) {
    onChange(sorted.filter((_, i) => i !== index).map((b, i) => ({ ...b, sortOrder: i })));
  }

  function addBlock(type: WelcomeBlockType) {
    onChange([...sorted, emptyBlock(type, sorted.length)]);
  }

  function updateCtaButton(blockIndex: number, btnIndex: number, patch: Partial<WelcomeCtaButton>) {
    const block = sorted[blockIndex];
    const buttons = [...(block.ctaJson?.buttons ?? [])];
    buttons[btnIndex] = { ...buttons[btnIndex], ...patch };
    updateBlock(blockIndex, { ctaJson: { buttons } });
  }

  function addCtaButton(blockIndex: number) {
    const block = sorted[blockIndex];
    const buttons = [...(block.ctaJson?.buttons ?? [])];
    buttons.push({ labelFr: "", labelEn: "", action: "route", target: "profile" });
    updateBlock(blockIndex, { ctaJson: { buttons } });
  }

  function removeCtaButton(blockIndex: number, btnIndex: number) {
    const block = sorted[blockIndex];
    const buttons = (block.ctaJson?.buttons ?? []).filter((_, i) => i !== btnIndex);
    updateBlock(blockIndex, { ctaJson: { buttons } });
  }

  const contentKey = lang === "fr" ? "contentFr" : "contentEn";

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Ajouter
          </span>
          {(Object.keys(BLOCK_META) as WelcomeBlockType[]).map((type) => {
            const { label, Icon } = BLOCK_META[type];
            return (
              <Button
                key={type}
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => addBlock(type)}
              >
                <Icon className="mr-1 h-4 w-4" /> {label}
              </Button>
            );
          })}
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Aucun bloc dans le brouillon
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Chaque bloc devient un message distinct dans la conversation officielle.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          {sorted.map((block, index) => (
            <BlockCard
              key={index}
              block={block}
              index={index}
              total={sorted.length}
              lang={lang}
              disabled={disabled}
              contentKey={contentKey}
              onUpdate={(patch) => updateBlock(index, patch)}
              onMove={(dir) => moveBlock(index, dir)}
              onRemove={() => removeBlock(index)}
              onUpdateCta={(bi, patch) => updateCtaButton(index, bi, patch)}
              onAddCta={() => addCtaButton(index)}
              onRemoveCta={(bi) => removeCtaButton(index, bi)}
            />
          ))}
        </div>
      </div>

      <div className="self-start xl:sticky xl:top-6">
        <PreviewPanel
          content={content}
          lang={lang}
          onLangChange={setLang}
          modalTitle="Message de bienvenue"
        />
      </div>
    </div>
  );
}

/* ── Carte de bloc ───────────────────────────────────────────────────────── */

interface BlockCardProps {
  block: WelcomeBlock;
  index: number;
  total: number;
  lang: PreviewLang;
  disabled?: boolean;
  contentKey: "contentFr" | "contentEn";
  onUpdate: (patch: Partial<WelcomeBlock>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onUpdateCta: (btnIndex: number, patch: Partial<WelcomeCtaButton>) => void;
  onAddCta: () => void;
  onRemoveCta: (btnIndex: number) => void;
}

function BlockCard({
  block,
  index,
  total,
  lang,
  disabled,
  contentKey,
  onUpdate,
  onMove,
  onRemove,
  onUpdateCta,
  onAddCta,
  onRemoveCta,
}: BlockCardProps) {
  const { label, Icon } = BLOCK_META[block.blockType];
  const isMedia = block.blockType === "image" || block.blockType === "video";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800">
          {index + 1}
        </span>
        <Icon className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Monter"
            disabled={disabled || index === 0}
            onClick={() => onMove(-1)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Descendre"
            disabled={disabled || index === total - 1}
            onClick={() => onMove(1)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            aria-label="Supprimer le bloc"
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {block.blockType !== "cta" && (
          <div className="space-y-2">
            <Label>
              {block.blockType === "text"
                ? lang === "fr"
                  ? "Message FR"
                  : "Message EN"
                : lang === "fr"
                  ? "Légende FR"
                  : "Légende EN"}
            </Label>
            <RichTextArea
              value={(block[contentKey] as string) ?? ""}
              disabled={disabled}
              onChange={(v) => onUpdate({ [contentKey]: v })}
              placeholder={block.blockType === "text" ? "Message…" : "Légende (optionnelle)"}
              rows={block.blockType === "text" ? 5 : 3}
            />
            {lang === "en" && !((block.contentEn ?? "").trim()) && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Vide : les utilisateurs anglophones verront le texte français.
              </p>
            )}
          </div>
        )}

        {isMedia && (
          <div className="space-y-2">
            <Label>Média</Label>
            {block.mediaUrl ? (
              <p className="truncate text-xs text-zinc-500">{block.mediaUrl}</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Aucun média — le bloc arrivera vide chez l&apos;utilisateur.
              </p>
            )}
            <FileUpload
              accept={block.blockType === "image" ? "image/*" : "video/*"}
              disabled={disabled}
              onUploadComplete={(url) => onUpdate({ mediaUrl: url })}
            />
          </div>
        )}

        {block.blockType === "cta" && (
          <div className="space-y-3">
            {(block.ctaJson?.buttons ?? []).map((btn, bi) => {
              // Le serveur écarte les boutons sans libellé ou sans cible.
              const dropped = !(lang === "en" ? btn.labelEn || btn.labelFr : btn.labelFr || btn.labelEn) || !btn.target;
              return (
                <div
                  key={bi}
                  className={cn(
                    "space-y-2 rounded-lg border p-3",
                    dropped
                      ? "border-amber-300 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20"
                      : "border-zinc-100 dark:border-zinc-800",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Bouton {bi + 1}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label="Supprimer le bouton"
                      disabled={disabled}
                      onClick={() => onRemoveCta(bi)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Libellé FR"
                    value={btn.labelFr}
                    disabled={disabled}
                    onChange={(e) => onUpdateCta(bi, { labelFr: e.target.value })}
                  />
                  <Input
                    placeholder="Libellé EN"
                    value={btn.labelEn}
                    disabled={disabled}
                    onChange={(e) => onUpdateCta(bi, { labelEn: e.target.value })}
                  />
                  <select
                    className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-2 text-sm dark:border-zinc-700"
                    value={btn.action === "url" ? "url" : `route:${btn.target}`}
                    disabled={disabled}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "url") {
                        onUpdateCta(bi, { action: "url", target: "https://" });
                      } else if (v.startsWith("route:")) {
                        onUpdateCta(bi, { action: "route", target: v.slice(6) });
                      }
                    }}
                  >
                    {ROUTE_OPTIONS.map((o) => (
                      <option key={o.value} value={`route:${o.value}`}>
                        {o.label}
                      </option>
                    ))}
                    <option value="url">URL externe</option>
                  </select>
                  {btn.action === "url" && (
                    <Input
                      placeholder="https://…"
                      value={btn.target}
                      disabled={disabled}
                      onChange={(e) => onUpdateCta(bi, { target: e.target.value })}
                    />
                  )}
                  {dropped && (
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      Libellé ou destination manquant — ce bouton ne sera pas envoyé.
                    </p>
                  )}
                </div>
              );
            })}
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onAddCta}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter un bouton
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
