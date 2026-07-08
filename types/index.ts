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

export interface User {
  alanyaID: number;
  nom: string;
  pseudo: string;
  alanyaPhone: string;
  email: string;
  idPays: number;
  avatarUrl: string;
  typeCompte: number;
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

export interface PaginatedReservedAlanyaPhones {
  items: ReservedAlanyaPhone[];
  total: number;
  page: number;
  limit: number;
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
