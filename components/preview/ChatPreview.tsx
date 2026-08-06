"use client";

import { RichTextMessage } from "@/components/ui/rich-text-message";
import { AccountBadgeIcon } from "@/components/account-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  Megaphone,
  Mic,
  Paperclip,
  Phone,
  Play,
  Smile,
  Type as TypeIcon,
  Video,
} from "lucide-react";
import {
  parseCtaPayload,
  WELCOME_CTA_MSG_TYPE,
  type PreviewLang,
  type PreviewMessage,
} from "./types";

/**
 * Rendu de la conversation, transposé du code Flutter.
 *
 * Chaque cote provient de :
 *  - chat_detail_screen.dart:938-1000 (fond) et :1164 (app bar)
 *  - chat_bubbles.dart:163-305 (bulles, horodatage)
 *  - chat_input.dart:464-561 (barre de saisie)
 *  - welcome_cta_buttons.dart (boutons CTA)
 *
 * Ne pas « arrondir » ces valeurs : l'écran sert justement à vérifier le rendu
 * réel avant envoi.
 */

/** Couleur d'un lien dans une bulle — `colors.primary`, pas le bleu de l'admin. */
const BUBBLE_LINK_CLASS = "underline [color:var(--app-primary)] [text-decoration-color:var(--app-primary)]";

interface ChatPreviewProps {
  messages: PreviewMessage[];
  senderName?: string;
  senderAvatar?: string | null;
  /**
   * Compte officiel (`account_type === 2`). Change trois choses d'un coup, car
   * c'est ce que fait l'app : sceau doré dans le titre, **pas d'icônes
   * d'appel** (`_callsDisabled` est vrai dès que le pair est officiel,
   * chat_detail_screen.dart:687-689) et **pas de composeur** — le verrou
   * `ComposerLock.official` le remplace par un bandeau de lecture seule
   * (chat_input.dart:68-98).
   */
  official?: boolean;
  /** Horodatage affiché sous chaque bulle. */
  time?: string;
  emptyLabel?: string;
  lang?: PreviewLang;
}

export function ChatPreview({
  messages,
  senderName = "Alanya",
  senderAvatar,
  official = true,
  time = "09:41",
  emptyLabel = "Aucun contenu",
  lang = "fr",
}: ChatPreviewProps) {
  return (
    <div className="flex h-full flex-col" style={{ color: "var(--app-on-surface)" }}>
      <ChatAppBar name={senderName} avatar={senderAvatar} official={official} />

      {/* Fond : surfaceMuted + tuile de motif (ChatWallpaper). */}
      <div
        className="app-wallpaper relative min-h-0 flex-1 overflow-hidden"
        style={{ backgroundColor: "var(--app-surface-muted)" }}
      >
        {/* padding: EdgeInsets.all(AppSpacing.lg) — chat_detail_screen.dart:1052 */}
        <div className="relative z-[1] flex h-full flex-col justify-end overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p
              className="py-10 text-center text-[13px]"
              style={{ color: "var(--app-on-surface-variant)" }}
            >
              {emptyLabel}
            </p>
          ) : (
            <>
              <DateSeparator label={lang === "en" ? "Today" : "Aujourd'hui"} />
              {messages.map((msg, i) => (
                <Bubble key={i} message={msg} time={time} />
              ))}
            </>
          )}
        </div>
      </div>

      {official ? <OfficialLockBanner lang={lang} /> : <ChatInputBar />}
    </div>
  );
}

/* ── App bar ─────────────────────────────────────────────────────────────── */

function ChatAppBar({
  name,
  avatar,
  official,
}: {
  name: string;
  avatar?: string | null;
  official: boolean;
}) {
  return (
    <div
      className="flex h-14 shrink-0 items-center"
      style={{ backgroundColor: "var(--app-surface)" }}
    >
      {/* leadingWidth par défaut = 56, icône 24 centrée. */}
      <div className="flex w-14 shrink-0 items-center justify-center">
        <ArrowLeft size={24} strokeWidth={2} style={{ color: "var(--app-on-surface)" }} />
      </div>

      <Avatar name={name} url={avatar} size={40} />

      {/* AppSpacing.hGapMd = 12.
          Pas de ligne de présence : l'app n'en affiche une que si le serveur
          en renvoie une. En inventer une ferait croire à un état réel. */}
      <div className="ml-3 flex min-w-0 flex-1 items-center">
        <span className="truncate text-[16px] font-semibold leading-tight">{name}</span>
        {official ? (
          // AccountBadgeLabel : 4 px d'écart, taille fontSize + 2 = 18.
          <AccountBadgeIcon
            accountType={2}
            verificationStatus={0}
            size={18}
            className="ml-1"
            sealStroke="var(--app-surface)"
          />
        ) : null}
      </div>

      {/* Les appels sont désactivés face à un compte officiel : l'app ne
          construit alors ni l'icône vidéo ni l'icône téléphone. */}
      {official ? null : (
        <div className="flex shrink-0 items-center">
          <div className="flex h-12 w-12 items-center justify-center">
            <Video size={24} style={{ color: "var(--app-primary)" }} />
          </div>
          <div className="flex h-12 w-12 items-center justify-center">
            <Phone size={24} style={{ color: "var(--app-primary)" }} />
          </div>
        </div>
      )}
      <div className="w-2 shrink-0" />
    </div>
  );
}

function Avatar({ name, url, size }: { name: string; url?: string | null; size: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--app-primary-container)",
        color: "var(--app-on-primary-container)",
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.42, fontWeight: 600 }}>{initial}</span>
      )}
    </div>
  );
}

/**
 * Pastille de date — `_buildDateSeparator` (chat_bubbles.dart:340-360).
 *
 * Son fond est `surfaceMuted`, donc opaque par-dessus le motif : c'est ce qui
 * la rend lisible malgré le wallpaper.
 */
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="my-[10px] flex justify-center">
      <span
        className="px-3 py-1 text-[11px] font-medium"
        style={{
          backgroundColor: "var(--app-surface-muted)",
          color: "var(--app-on-surface-variant)",
          borderRadius: 12,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Bulle ───────────────────────────────────────────────────────────────── */

function Bubble({ message, time }: { message: PreviewMessage; time: string }) {
  const isCta = message.type === WELCOME_CTA_MSG_TYPE;
  const buttons = isCta ? parseCtaPayload(message.content) : null;
  const caption = isCta ? null : message.content?.trim() || null;
  const hasMedia = !isCta && message.type !== 0;

  // Un bloc CTA dont tous les boutons sont invalides ne produit rien à l'écran.
  if (isCta && !buttons) return null;

  return (
    <div className="flex justify-start">
      <div
        // constraints: maxWidth = screenWidth * 0.75 (chat_bubbles.dart:166)
        // padding: 16 h / 12 v · margin-bottom: AppSpacing.md
        // radius: TL20 TR20 BR20 BL0 pour une entrante (:181-186)
        className="mb-3 max-w-[75%] px-4 py-3"
        style={{
          backgroundColor: "var(--app-surface)",
          borderRadius: "20px 20px 20px 0",
          boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
        }}
      >
        {hasMedia ? <BubbleMedia message={message} /> : null}

        {caption ? (
          // Légende : 6 px sous le média (chat_bubbles.dart:238), bodyLarge 15 px.
          <div className={cn("text-[15px] font-normal leading-[1.35]", hasMedia && "mt-1.5")}>
            <RichTextMessage text={caption} linkClassName={BUBBLE_LINK_CLASS} />
          </div>
        ) : null}

        {buttons ? <CtaButtons buttons={buttons} /> : null}

        {/* SizedBox(height: AppSpacing.xs) puis labelSmall forcé à 10 px. */}
        <div className="mt-1 flex items-center">
          <span className="text-[10px] leading-none" style={{ color: "var(--app-on-surface-variant)" }}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}

function BubbleMedia({ message }: { message: PreviewMessage }) {
  const url = message.mediaUrl?.trim() || null;

  // Image — ClipRRect(AppRadius.brSm = 12)
  if (message.type === 1) {
    return (
      <div
        className="overflow-hidden"
        style={{ borderRadius: 12, backgroundColor: "var(--app-surface-muted)" }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="block max-h-[260px] w-full object-cover" />
        ) : (
          <MediaPlaceholder label="Image" />
        )}
      </div>
    );
  }

  // Vidéo — vignette sombre + pastille de lecture
  if (message.type === 2) {
    return (
      <div
        className="relative flex h-[160px] items-center justify-center overflow-hidden bg-black/80"
        style={{ borderRadius: 12 }}
      >
        {url ? (
          <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55">
            <Play size={22} className="ml-0.5 text-white" fill="white" />
          </div>
        </div>
      </div>
    );
  }

  // Audio
  if (message.type === 3) {
    return (
      <div className="flex items-center gap-2.5 py-0.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--app-primary)" }}
        >
          <Play size={16} style={{ color: "var(--app-on-primary)" }} fill="currentColor" />
        </div>
        <div className="flex h-6 flex-1 items-center gap-[3px]">
          {[9, 15, 7, 18, 11, 20, 8, 14, 6, 16, 10, 19, 7, 12, 9].map((h, i) => (
            <span
              key={i}
              className="w-[2px] rounded-full"
              style={{ height: h, backgroundColor: "var(--app-on-surface-variant)", opacity: 0.55 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Fichier
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--app-primary-container)" }}
      >
        <FileText size={20} style={{ color: "var(--app-on-primary-container)" }} />
      </div>
      <span className="truncate text-[14px]">
        {url ? decodeURIComponent(url.split("/").pop() || "Document") : "Document"}
      </span>
    </div>
  );
}

function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex h-[140px] items-center justify-center text-[12px]"
      style={{ color: "var(--app-on-surface-variant)" }}
    >
      {label} — aucun média
    </div>
  );
}

/**
 * Boutons CTA — welcome_cta_buttons.dart.
 * Pleine largeur, 4 px d'écart, padding 12/8, rayon 12, fond primary à 8 %.
 */
function CtaButtons({ buttons }: { buttons: NonNullable<ReturnType<typeof parseCtaPayload>> }) {
  return (
    <div className="flex flex-col items-stretch">
      {buttons.map((btn, i) => (
        <div
          key={i}
          className="mt-1 flex items-center justify-center text-[15px] font-semibold"
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            backgroundColor: "color-mix(in srgb, var(--app-primary) 8%, transparent)",
            color: "var(--app-primary)",
          }}
        >
          {btn.label}
        </div>
      ))}
    </div>
  );
}

/* ── Verrou du compte officiel ───────────────────────────────────────────── */

/**
 * Bandeau qui remplace le composeur face au compte officiel —
 * `_buildOfficialBanner` (chat_input.dart:75-98).
 *
 * Son fond est `surfaceMuted`, la même couleur que le fond de discussion : il
 * ne se détache pas, il ferme simplement le fil.
 */
function OfficialLockBanner({ lang }: { lang: PreviewLang }) {
  return (
    <div
      className="flex w-full shrink-0 items-center gap-2 px-4 pb-7 pt-3"
      style={{ backgroundColor: "var(--app-surface-muted)" }}
    >
      <Megaphone size={18} className="shrink-0" style={{ color: "var(--app-on-surface-variant)" }} />
      <span className="text-[12px] leading-snug" style={{ color: "var(--app-on-surface-variant)" }}>
        {lang === "en"
          ? "This account sends announcements. You cannot reply."
          : "Ce compte diffuse des annonces. Vous ne pouvez pas y répondre."}
      </span>
    </div>
  );
}

/* ── Barre de saisie ─────────────────────────────────────────────────────── */

function ChatInputBar() {
  return (
    // Padding: fromLTRB(8, 6, 8, 8) — chat_input.dart:473
    <div className="flex shrink-0 items-end gap-2 px-2 pb-5 pt-1.5">
      <div
        className="flex min-h-[50px] flex-1 items-center gap-1"
        style={{
          backgroundColor: "var(--app-surface)",
          borderRadius: 28,
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        }}
      >
        <span className="px-2.5">
          <Smile size={24} style={{ color: "var(--app-on-surface-variant)" }} />
        </span>
        <span className="flex-1 text-[15px]" style={{ color: "var(--app-on-surface-variant)" }}>
          Message
        </span>
        <span className="px-2.5">
          <TypeIcon size={24} style={{ color: "var(--app-on-surface-variant)" }} />
        </span>
        <span className="pr-3">
          <Paperclip size={22} style={{ color: "var(--app-on-surface-variant)" }} />
        </span>
      </div>
      {/* _RoundActionButton : 50×50, primary, icône 22. */}
      <div
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--app-primary)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Mic size={22} style={{ color: "var(--app-on-primary)" }} />
      </div>
    </div>
  );
}
