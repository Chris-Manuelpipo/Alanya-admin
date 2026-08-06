"use client";

import { Bold, Italic, Strikethrough, Underline, PenLine } from "lucide-react";
import type { RichTextMarker } from "@/lib/rich-text-parser";

const FORMATS: { marker: RichTextMarker; label: string; icon: React.ElementType }[] = [
  { marker: "*", label: "Gras", icon: Bold },
  { marker: "_", label: "Italique", icon: Italic },
  { marker: "=", label: "Souligné", icon: Underline },
  { marker: "~", label: "Barré", icon: Strikethrough },
  { marker: "#", label: "Manuscrit", icon: PenLine },
];

interface RichTextToolbarProps {
  onFormat: (marker: RichTextMarker) => void;
  disabled?: boolean;
  emojiSlot?: React.ReactNode;
}

export function RichTextToolbar({ onFormat, disabled, emojiSlot }: RichTextToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-1">
      {FORMATS.map(({ marker, label, icon: Icon }) => (
        <button
          key={marker}
          type="button"
          title={label}
          disabled={disabled}
          onClick={() => onFormat(marker)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      {emojiSlot ? <div className="ml-auto">{emojiSlot}</div> : null}
    </div>
  );
}
