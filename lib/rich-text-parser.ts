/** Marqueurs inline — alignés sur Alanya/lib/core/utils/rich_text_parser.dart */

export type RichTextMarker = "*" | "_" | "~" | "=" | "#";

export interface RichTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  handwriting?: boolean;
  link?: string;
}

const URL_REGEXP = /((?:https?:\/\/|www\.)[^\s]+)/gi;

const MARKERS: Record<
  string,
  (style: Omit<RichTextSegment, "text">) => Omit<RichTextSegment, "text">
> = {
  "*": (s) => ({ ...s, bold: true }),
  _: (s) => ({ ...s, italic: true }),
  "~": (s) => ({ ...s, strike: true }),
  "=": (s) => ({ ...s, underline: true }),
  "#": (s) => ({ ...s, handwriting: true }),
};

function trimUrlTail(url: string): string {
  const tail = ".,;:!?)]}'\"";
  let end = url.length;
  while (end > 0 && tail.includes(url[end - 1]!)) end--;
  return url.slice(0, end);
}

function findClose(text: string, from: number, marker: string): number {
  if (from >= text.length || text[from] === " ") return -1;
  for (let j = from; j < text.length; j++) {
    if (text[j] === marker) {
      return j === from ? -1 : j;
    }
  }
  return -1;
}

function appendWithLinks(
  out: RichTextSegment[],
  text: string,
  style: Omit<RichTextSegment, "text">,
) {
  let last = 0;
  const re = new RegExp(URL_REGEXP.source, URL_REGEXP.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      out.push({ text: text.slice(last, match.index), ...style });
    }
    const raw = match[0]!;
    const url = trimUrlTail(raw);
    out.push({ text: url, ...style, link: url });
    if (url.length < raw.length) {
      out.push({ text: raw.slice(url.length), ...style });
    }
    last = match.index + raw.length;
  }
  if (last < text.length) {
    out.push({ text: text.slice(last), ...style });
  }
}

function parseInner(
  text: string,
  style: Omit<RichTextSegment, "text">,
): RichTextSegment[] {
  const spans: RichTextSegment[] = [];
  let buffer = "";

  function flush() {
    if (buffer) {
      appendWithLinks(spans, buffer, style);
      buffer = "";
    }
  }

  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    const transform = MARKERS[ch];
    if (transform) {
      const close = findClose(text, i + 1, ch);
      if (close !== -1) {
        flush();
        const inner = text.slice(i + 1, close);
        spans.push(...parseInner(inner, transform(style)));
        i = close + 1;
        continue;
      }
    }
    buffer += ch;
    i++;
  }

  flush();
  return spans;
}

/** Découpe le texte en segments stylés (gras, italique, liens, etc.). */
export function parseRichSpans(text: string): RichTextSegment[] {
  if (!text) return [];
  return parseInner(text, {});
}

/** Retire les marqueurs pour les aperçus texte brut. */
export function stripMarkers(text: string): string {
  return text.replace(/[*_~=#]/g, "");
}

/** Applique un marqueur à la sélection (même logique que chat_input.dart). */
export function applyFormat(
  text: string,
  marker: RichTextMarker,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number } {
  const start = selectionStart < 0 ? text.length : selectionStart;
  const end = selectionEnd < 0 ? text.length : selectionEnd;

  if (start === end) {
    const next = text.slice(0, start) + marker + marker + text.slice(end);
    return { next, cursor: start + marker.length };
  }
  const selected = text.slice(start, end);
  const next = text.slice(0, start) + marker + selected + marker + text.slice(end);
  return { next, cursor: end + marker.length * 2 };
}
