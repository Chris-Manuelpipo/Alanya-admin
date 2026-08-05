"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMOJI_CATEGORIES } from "@/lib/emoji-catalog";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
}

export function EmojiPicker({ onSelect, disabled, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(EMOJI_CATEGORIES[0].id);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeCategory =
    EMOJI_CATEGORIES.find((c) => c.id === categoryId) ?? EMOJI_CATEGORIES[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(emoji: string) {
    onSelect(emoji);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Insérer un emoji"
        className="h-8 gap-1.5 px-2.5 text-zinc-600 dark:text-zinc-300"
        onClick={() => setOpen((v) => !v)}
      >
        <Smile className="h-4 w-4" />
        Emoji
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Sélecteur d'emojis"
          className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                  categoryId === cat.id
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
            {activeCategory.emojis.map((emoji) => (
              <button
                key={`${activeCategory.id}-${emoji}`}
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => pick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
