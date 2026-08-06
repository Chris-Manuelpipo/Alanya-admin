"use client";

interface LangTabsProps {
  value: "fr" | "en";
  onChange: (lang: "fr" | "en") => void;
  className?: string;
}

export function LangTabs({ value, onChange, className = "" }: LangTabsProps) {
  return (
    <div className={`flex gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-fit ${className}`}>
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            value === l
              ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {l === "fr" ? "Français" : "English"}
        </button>
      ))}
    </div>
  );
}
