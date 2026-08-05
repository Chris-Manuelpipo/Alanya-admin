/** Type média d'un statut officiel : 0 texte, 1 image, 2 vidéo. */
export function statutMediaType(mediaUrl?: string | null): number {
  if (!mediaUrl?.trim()) return 0;
  return /\.(mp4|webm|mov|m4v|mkv|avi)(\?|#|$)/i.test(mediaUrl) ? 2 : 1;
}

/** Payload API : kind=1 pour statut, 0 pour message. */
export function toBroadcastApiPayload(data: import("@/types").BroadcastFormData) {
  const isStatus = data.isStatus === true || data.kind === 1;
  return {
    senderId: data.senderId,
    content: data.content,
    type: isStatus ? statutMediaType(data.mediaUrl) : data.type,
    mediaUrl: data.mediaUrl,
    criteria: data.criteria,
    clientId: data.clientId,
    kind: isStatus ? 1 : 0,
    scheduledAt: data.scheduledAt,
    confirmedEstimate: data.confirmedEstimate,
  };
}
