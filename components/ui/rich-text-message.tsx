"use client";

import { parseRichSpans, type RichTextSegment } from "@/lib/rich-text-parser";

interface RichTextMessageProps {
  text: string;
  className?: string;
  /**
   * Habillage des liens. Par défaut le bleu de l'admin ; l'aperçu mobile passe
   * l'indigo de marque, car c'est `colors.primary` que l'app utilise
   * (chat_bubbles.dart:246).
   */
  linkClassName?: string;
}

const DEFAULT_LINK_CLASS = "text-blue-600 underline decoration-blue-600";

function segmentClass(seg: RichTextSegment, linkClassName: string): string {
  const parts: string[] = [];
  if (seg.bold) parts.push("font-bold");
  if (seg.italic) parts.push("italic");
  if (seg.strike) parts.push("line-through");
  if (seg.underline) parts.push("underline");
  if (seg.handwriting) parts.push("font-handwriting text-[1.25em] leading-snug");
  if (seg.link) parts.push(linkClassName);
  return parts.join(" ");
}

export function RichTextMessage({
  text,
  className = "",
  linkClassName = DEFAULT_LINK_CLASS,
}: RichTextMessageProps) {
  if (!text) return null;
  const spans = parseRichSpans(text);

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {spans.map((seg, i) =>
        seg.link ? (
          <a
            key={i}
            href={seg.link.startsWith("http") ? seg.link : `https://${seg.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className={segmentClass(seg, linkClassName)}
          >
            {seg.text}
          </a>
        ) : (
          <span key={i} className={segmentClass(seg, linkClassName)}>
            {seg.text}
          </span>
        ),
      )}
    </span>
  );
}
