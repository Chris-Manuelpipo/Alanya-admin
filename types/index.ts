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
  content: string;
  contentEn?: string | null;
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
  labelFr: string;
  labelEn: string;
  action: 'route' | 'url';
  target: string;
}

export interface WelcomeBlock {
  id?: number;
  sortOrder: number;
  blockType: WelcomeBlockType;
  contentFr?: string;
  contentEn?: string;
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
 * Statut de bienvenue — réglage **global et non versionné**, contrairement au
 * message : l'interrupteur prend effet sans passer par « Publier ».
 * Un statut 24 h est créé pour chaque nouvel inscrit, visible de lui seul.
 */
export interface WelcomeStatusConfig {
  enabled: boolean;
  /** 0 texte · 1 image · 2 vidéo */
  type: number;
  textFr: string;
  textEn: string;
  mediaUrl: string;
  /** `#RRGGBB` ; vide → indigo de marque `#3F51B5`. */
  backgroundColor: string;
  updatedAt: string | null;
  updatedBy: number | null;
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
