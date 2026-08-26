import type { ContentLocale, Translations } from "@/lib/content-locales";
export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  bannedUsers: number;
  messagesPeriod: number;
  callsPeriod: number;
  statusesPeriod: number;
  registrations: { date: string; count: number }[];
  activity: { date: string; count: number }[];
  topCountries: { pays: string; users: number }[];
  topUsers: TopUser[];
}

export interface TopUser {
  alanyaID: number;
  nom: string;
  pseudo: string;
  avatarUrl: string;
  messagesSent: number;
  callsMade: number;
  callsReceived: number;
}

export type AccountType = 0 | 1 | 2;
export type VerificationStatus = 0 | 1 | 2 | 3 | 4 | 5;

export interface User {
  alanyaID: number;
  nom: string;
  pseudo: string;
  alanyaPhone: string;
  email: string;
  idPays: number;
  avatarUrl: string;
  typeCompte: number;
  accountType: AccountType;
  verificationStatus: VerificationStatus;
  verifiedUntil: string | null;
  isOnline: boolean;
  lastSeen: string;
  exclus: boolean;
  excludeAt: string | null;
  excludeReason: string | null;
  createdAt: string | null;
  paysLibelle: string | null;
}

export interface UserDetail extends User {
  fcmToken: string;
  deviceID: string;
  paysPrefix: string;
}

export interface UserActivity {
  messagesSent: number;
  conversations: number;
  callsMade: number;
  callsReceived: number;
  statusesPublished: number;
}

export interface LoginEntry {
  idAccess: number;
  dateLogin: string;
  os_system: string;
  device: string;
  ipAdress: string;
}

export interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Pays {
  idPays: number;
  libelle: string;
  prefix: string;
  timeZone?: string;
  decalageHoraire?: string;
}

export interface CreateUserPayload {
  nom: string;
  pseudo: string;
  password: string;
  email?: string;
  alanyaPhone?: string;
  generateLength?: 3 | 4 | 8;
  idPays?: number;
  avatarGender?: 'male' | 'female';
  type_compte?: number;
  /** Genre de compte : 0 personnel, 1 business, 2 officiel. */
  account_type?: number;
}

/** Socle de compte — les deux axes pilotés depuis la fiche utilisateur. */
export interface SetUserSoclePayload {
  account_type?: number;
  verification_status?: number;
  verified_until?: string | null;
}

export interface ReservedAlanyaPhone {
  id: number;
  phoneCanonical: string;
  label: string;
  createdBy: number | null;
  createdAt: string;
  createdByNom?: string | null;
  isUsed: boolean;
  usedByAlanyaId?: number | null;
  usedByNom?: string | null;
  usedByPseudo?: string | null;
}

export interface PatternSuggestion {
  phoneCanonical: string;
  label: string;
  source: 'pattern';
  isUsed: boolean;
  assignable: boolean;
}

export interface PaginatedReservedAlanyaPhones {
  items: ReservedAlanyaPhone[];
  total: number;
  page: number;
  limit: number;
  patternSuggestion?: PatternSuggestion | null;
}

export interface AssignablePhoneCheck {
  phoneCanonical: string;
  tier: number;
  isPatternReserved: boolean;
  inReservedTable: boolean;
  isTaken: boolean;
  assignable: boolean;
  reason: string | null;
  source: 'pattern' | 'table' | 'standard';
  hint: string | null;
}

export interface ReservedAlanyaPhonesParams {
  page?: number;
  limit?: number;
  q?: string;
  available?: '0' | '1' | '';
}

export interface ActivityEntry {
  id: string;
  type: 'user_joined' | 'message' | 'call' | 'meeting' | 'status';
  user: string;
  detail: string;
  time: string;
}

// ── Analytics avancées (GET /api/admin/analytics) ──

export interface LabeledCount {
  type: number;
  label: string;
  count: number;
}

export interface CallStats {
  total: number;
  audio: number;
  video: number;
  answered: number;
  missed: number;
  rejected: number;
  avgDuration: number;
  totalDuration: number;
  successRate: number;
  relay: number;
  p2p: number;
  modeUnknown: number;
  relayRate: number;
  p2pRate: number;
}

export interface StoryStats {
  total: number;
  totalViews: number;
  totalLikes: number;
  avgViews: number;
  engagementRate: number;
  byType: LabeledCount[];
}

export interface MeetingStats {
  total: number;
  avgDuration: number;
  accepted: number;
  declined: number;
  invited: number;
  attendanceRate: number;
  noShowRate: number;
}

export interface UserAnalytics {
  byRole: { role: number; label: string; count: number }[];
  newUsers: number;
  bannedUsers: number;
  totalUsers: number;
}

export interface ConversationStats {
  total: number;
  groups: number;
  oneToOne: number;
  avgGroupSize: number;
}

export interface Analytics {
  messagesByType: LabeledCount[];
  messagesByDay: { date: string; count: number }[];
  calls: CallStats;
  callsByDay: { date: string; audio: number; video: number }[];
  stories: StoryStats;
  meetings: MeetingStats;
  users: UserAnalytics;
  devices: { os: string; count: number }[];
  conversations: ConversationStats;
  heatmap: { dow: number; hour: number; count: number }[];
  comparison: { messages: number; calls: number; statuses: number; registrations: number };
  period: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

/** Compteurs agrégés trajets — GET /api/admin/trips. Aucune identité. */
export interface TripKindCount {
  kind: "taxi" | "walk" | "sos";
  count: number;
}

export interface TripCloseReasonCount {
  reason: string;
  count: number;
}

export interface TripStats {
  openNow: number;
  started: number;
  startedPrevious: number;
  startedByDay: { date: string; count: number }[];
  confirmed: number;
  confirmedRate: number;
  alerted: number;
  alertedRate: number;
  sos: number;
  closed: number;
  durationMedianSec: number;
  durationP90Sec: number;
  avgExtensions: number;
  alertsClosed: number;
  alertsResolved: number;
  alertsResolvedMedianSec: number;
  byKind: TripKindCount[];
  byCloseReason: TripCloseReasonCount[];
  period: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

/** Rétention des traces GPS. Des volumes, jamais un trajet nommé. */
export interface TripRetention {
  policy: {
    pointsHours: number;
    pointsIncidentDays: number;
    tripMonths: number;
  };
  /** Tout ce qui dort en base, trajets en cours compris. */
  stored: { points: number; trips: number; oldestPointAt: string | null };
  /** Ce que le prochain balayage nocturne effacera. */
  expired: { points: number; trips: number };
  /** Ce qu'une purge manuelle immédiate effacerait : tous les trajets clos. */
  closed: { points: number; trips: number };
  purgedTrips: number;
  runs: TripPurgeRun[];
  lastRun?: TripPurgeRun;
}

export interface TripPurgeRun {
  at: string;
  scope: "retention" | "all";
  by: string | null;
  points: number;
  trips: number;
}

export interface Group {
  conversID: number;
  groupName: string;
  groupPhoto: string;
  lastMessage: string;
  lastMessageAt: string;
  members: number;
  createdAt: string;
}

export interface GroupMember {
  alanyaID: number;
  nom: string;
  pseudo: string;
  avatarUrl: string | null;
  alanyaPhone: string;
  isOnline: boolean;
  lastSeen: string | null;
  typeCompte: number;
  joinedAt: string | null;
}

export interface GroupDetail {
  conversID: number;
  groupName: string;
  groupPhoto: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  memberCount: number;
  messageCount: number;
  createdAt: string | null;
  members: GroupMember[];
}

export interface Meeting {
  idMeeting: number;
  idOrganiser: number;
  organiserNom: string;
  organiserPseudo: string;
  organiserAvatar: string;
  objet: string;
  room: string;
  startTime: string;
  duree: number;
  isEnd: number;
  typeMedia: number;
  participants: number;
  createdAt: string;
}

export interface AppSettings {
  maintenance: boolean;
  appName: string;
  apiUrl: string;
}

export interface MediaItem {
  id: number;
  senderID: number;
  senderNom: string;
  senderPseudo: string;
  senderAvatar: string;
  conversationID: number;
  conversationName: string;
  type: number;
  mediaUrl: string;
  mediaName: string;
  sendAt: string;
}

// ── Broadcast / Diffusion ──

export type BroadcastCriteriaField =
  | 'idPays'
  | 'idVille'
  | 'genre'
  | 'age'
  | 'account_type'
  | 'verification_status'
  | 'created_at'
  | 'last_seen'
  | 'verified_until'
  | 'alanyaID';

export type BroadcastCriteriaOp =
  | 'eq'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'before'
  | 'after';

export interface BroadcastCondition {
  field: BroadcastCriteriaField;
  op: BroadcastCriteriaOp;
  value: unknown;
}

export interface BroadcastCriteria {
  v?: number;
  /**
   * Seul `and` est supporté : `criteriaResolver.js` rejette `or` par un 400
   * (« Seul op=and est supporté »).
   */
  op: 'and';
  conditions: BroadcastCondition[];
  resolvedAt?: string | null;
}

export type BroadcastPushStatus =
  | 'preparing'
  | 'queued'
  | 'running'
  | 'completed'
  | 'partial_failed';

export interface Broadcast {
  id: number;
  senderId: number;
  senderName?: string;
  createdBy: number;
  kind?: number;
  content: string;
  contentEn?: string | null;
  type: number;
  mediaUrl: string | null;
  /** Statut uniquement — `#RRGGBB` ; null = indigo de marque. */
  backgroundColor: string | null;
  criteria: BroadcastCriteria;
  estimate: number;
  clientId: string;
  status: BroadcastPushStatus | string;
  pushJobsTotal: number;
  pushJobsDone: number;
  pushFailedJobs: number;
  pushProgress: number;
  pushCompletedAt: string | null;
  deliveredCount: number;
  deliveredCountRefreshedAt: string | null;
  openRate: number;
  sentAt: string;
}

export interface BroadcastEstimateResult {
  count: number;
  /** Critères après gel des dates relatives (`resolveRelativeDates`). */
  criteria: BroadcastCriteria;
}

export interface ScheduledBroadcast {
  jobId: number;
  scheduledAt: string;
  payload: Record<string, unknown>;
}

export interface BroadcastFormData {
  senderId: number;
  /** @deprecated Dérivé de `translations.fr` ; conservé le temps que le backend garde ses colonnes héritées. */
  content: string;
  /** @deprecated Dérivé de `translations.en` — voir `content`. */
  contentEn?: string | null;
  /** Contenu par locale — forme de référence depuis la migration 053. */
  translations?: Translations;
  type: number;
  mediaUrl?: string;
  /** Statut uniquement — `#RRGGBB` ; vide = indigo de marque. */
  backgroundColor?: string;
  criteria: BroadcastCriteria;
  clientId: string;
  kind?: number;
  isStatus?: boolean;
  scheduledAt?: string;
  /** Estimation affichée à l'admin, stockée avec la diffusion. */
  estimate?: number;
  /** Estimation confirmée — comparée au recomptage serveur au moment de l'envoi. */
  confirmedEstimate?: number;
}

export interface BroadcastsResponse {
  items: Broadcast[];
  scheduled?: ScheduledBroadcast[];
  total: number;
  page: number;
  limit: number;
}

export type WelcomeBlockType = 'text' | 'image' | 'video' | 'cta';

export interface WelcomeCtaButton {
  /** @deprecated Dérivé de `translations.fr` — voir `WelcomeBlock.ctaTranslations`. */
  labelFr: string;
  /** @deprecated Dérivé de `translations.en`. */
  labelEn: string;
  action: 'route' | 'url';
  target: string;
}

export interface WelcomeBlock {
  id?: number;
  sortOrder: number;
  blockType: WelcomeBlockType;
  /** @deprecated Dérivé de `translations.fr` le temps de la double écriture. */
  contentFr?: string;
  /** @deprecated Dérivé de `translations.en`. */
  contentEn?: string;
  /** Corps du bloc par locale — forme de référence depuis la migration 053. */
  translations?: Translations;
  /** Libellés des boutons, un enregistrement par bouton, dans l'ordre du tableau. */
  ctaTranslations?: Translations[];
  mediaUrl?: string;
  ctaJson?: { buttons: WelcomeCtaButton[] };
}

export interface WelcomeConfig {
  id: number;
  version: number;
  isActive: boolean;
  isDraft: boolean;
  publishedAt: string | null;
  publishedBy: number | null;
  blocks: WelcomeBlock[];
}

export interface WelcomeAdminState {
  active: WelcomeConfig | null;
  draft: WelcomeConfig | null;
  pendingBackfill: number;
}

/**
 * Un élément du statut de bienvenue : il devient un statut 24 h distinct.
 *
 * Même principe que les blocs du message — plusieurs éléments sont publiés
 * d'un coup, dans l'ordre, à la fin de l'onboarding.
 */
export interface WelcomeStatusBlock {
  /** Absent tant que l'élément n'a jamais été enregistré. */
  id?: number;
  sortOrder: number;
  /** 0 texte · 1 image · 2 vidéo */
  type: number;
  /** Texte (ou légende) par locale. */
  translations: Translations;
  mediaUrl: string;
  /** `#RRGGBB` ; vide → indigo de marque `#3F51B5`. Statuts texte seulement. */
  backgroundColor: string;
}

/**
 * Statut de bienvenue — réglage **global et non versionné**, contrairement au
 * message : l'interrupteur prend effet sans passer par « Publier ».
 * Ses statuts 24 h sont créés pour chaque nouvel inscrit, visibles de lui seul.
 */
export interface WelcomeStatusConfig {
  enabled: boolean;
  blocks: WelcomeStatusBlock[];
  updatedAt: string | null;
  updatedBy: number | null;
  /**
   * Le serveur connaît-il les éléments multiples ?
   *
   * Faux tant qu'il répond dans la forme d'avant la migration 071 : il
   * n'enregistrerait alors que le premier élément, et l'éditeur doit le dire
   * plutôt que de laisser disparaître les suivants. Transitoire — à retirer
   * une fois la 071 déployée partout.
   */
  supportsMultiple: boolean;
}

/** `statut.text` est un TINYTEXT — mêmes bornes que `STATUS_TEXT_MAX` côté serveur. */
export const WELCOME_STATUS_TEXT_MAX = 200;

export interface Ville {
  idVille: number;
  libelle: string;
  idPays: number;
}

// ── Admin Profile ──

export interface AdminProfile {
  alanyaID: number;
  nom: string;
  pseudo: string;
  email: string | null;
  alanyaPhone: string;
  avatarUrl: string;
  typeCompte: number;
  /**
   * Permissions effectives, calculées par le serveur.
   *
   * Le panneau ne recopie pas la table des rôles : elle divergerait au premier
   * oubli, et un rôle qui change ne demanderait alors aucun redéploiement ici.
   */
  permissions: string[];
  paysLibelle: string | null;
  createdAt: string;
  lastSeen: string;
}

export interface UpdateProfilePayload {
  nom?: string;
  pseudo?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ── Purges de rétention (espace super-admin) ──

export interface PurgeKnob {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  defaut: number;
  valeur: number;
}

/**
 * Une exécution de purge.
 *
 * Clés en camelCase : le client axios (lib/api.ts) normalise toute réponse
 * via `snakeToCamel`. Les colonnes SQL `ran_at`, `trigger_source`,
 * `by_admin`, `duration_ms` arrivent donc déjà converties côté page.
 */
export interface PurgeRun {
  id: number;
  name: string;
  ranAt: string;
  triggerSource: 'auto' | 'manual';
  byAdmin: string | null;
  ok: 0 | 1;
  result: unknown;
  error: string | null;
  durationMs: number | null;
}

export interface PurgeSetting {
  name: string;
  label: string;
  description: string;
  enabled: boolean;
  options: Record<string, number>;
  defauts: Record<string, number>;
  surcharges: Record<string, number>;
  knobs: PurgeKnob[];
  /** Volumétrie qui serait supprimée maintenant. Forme variable selon la purge. */
  stats: Record<string, unknown> | null;
  statsErreur: string | null;
  runs: PurgeRun[];
  updatedAt: string | null;
  updatedBy: string | null;
}

/**
 * Une action d'administration enregistrée.
 *
 * `action` est un verbe métier (`users.ban`), `route` la méthode et le chemin.
 * Les deux coexistent : sur une route cartographiée ils disent la même chose,
 * mais une ligne `unmapped` n'aurait aucun sens sans le second.
 */
export interface AuditEntry {
  id: number;
  action: string;
  route: string;
  targetType: string | null;
  targetId: string | null;
  reason: string | null;
  ip: string | null;
  statusCode: number;
  createdAt: string;
  adminId: number | null;
  adminNom: string | null;
  adminEmail: string | null;
}

/** Vocabulaire réellement présent dans le journal, pour alimenter les filtres. */
export interface AuditActionCount {
  action: string;
  n: number;
  derniere: string | null;
}

/* ── Modération ─────────────────────────────────────────────────────────── */

/** État d'un signalement. La file se vide de `open` vers les deux issues. */
export type ReportState = "open" | "reviewing" | "actioned" | "dismissed";

export interface Report {
  id: number;
  targetType: "message" | "user";
  targetMsgId: number | null;
  targetUserId: number | null;
  reason: string;
  /** Précision libre laissée par l'auteur du signalement. */
  note: string | null;
  state: ReportState;
  createdAt: string;
  reporterId: number | null;
  reporterNom: string | null;
  /** Compte visé, quand le signalement porte sur un compte. */
  targetNom: string | null;
  targetExclus: boolean;
  /**
   * Le message signalé. Servi ici et nulle part ailleurs dans le panneau :
   * signaler un message, c'est demander qu'il soit lu par l'équipe.
   * `null` si le message a été supprimé depuis — le signalement lui survit.
   */
  msgSenderId: number | null;
  msgSenderNom: string | null;
  msgType: number | null;
  msgContent: string | null;
  msgDeleted: boolean;
  msgSentAt: string | null;
  /** Nombre de décisions déjà prises. */
  actions: number;
}

export interface ReportAction {
  id: number;
  action: string;
  note: string | null;
  createdAt: string;
  adminId: number | null;
  adminNom: string | null;
}

/* ── Assistance éditoriale ───────────────────────────────────────────── */

/**
 * Nature du contenu soumis à l'assistance.
 *
 * Miroir de `KINDS` (Alanya-Backend/src/services/ai/editorialAssist.js) : le
 * ton et la longueur attendus en dépendent, et le serveur refuse une nature
 * qu'il ne connaît pas.
 */
export type AiContentKind = "welcome" | "broadcast" | "status" | "cta";

/** Disponibilité de l'assistance — sans clé configurée, aucun bouton. */
export interface AiStatus {
  enabled: boolean;
  model: string | null;
}

export interface AiTranslateResult {
  /** Traductions produites, par locale. Une langue peut manquer. */
  translations: Translations;
  /**
   * Langues demandées que le modèle n'a pas rendues.
   *
   * Elles ressortent ici plutôt que remplies d'une valeur bancale : l'éditeur
   * les signale déjà comme il signale une traduction non saisie.
   */
  missing: ContentLocale[];
  /** Remarques du modèle à l'intention du relecteur. Souvent vide. */
  notes: string[];
  model: string;
}

export interface AiFinding {
  locale: ContentLocale;
  severity: "bloquant" | "attention" | "suggestion";
  message: string;
}

export interface AiReviewResult {
  findings: AiFinding[];
  model: string;
}
