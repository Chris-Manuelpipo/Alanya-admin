import { AdminStats, Analytics, TripStats, TripRetention, ActivityEntry, UsersResponse, UserDetail, UserActivity, LoginEntry, Group, GroupDetail, Meeting, MediaItem, AppSettings, Pays, Broadcast, BroadcastsResponse, BroadcastFormData, BroadcastEstimateResult, AdminProfile, Ville, PurgeSetting, PurgeRun } from '@/types';
import { mockStats, mockActivityFeed } from '@/mock/stats';
import { mockAnalytics } from '@/mock/analytics';
import { mockTripRetention, mockTripStats } from '@/mock/trips';
import { mockUsersResponse, mockUserDetail, mockUserActivity, mockLoginHistory } from '@/mock/users';
import { mockGroups, mockGroupDetail } from '@/mock/groups';
import { mockMeetings } from '@/mock/meetings';
import { mockMediaItems } from '@/mock/medias';
import { mockCountries } from '@/mock/countries';
import { api } from './api';
import { normalizeApiDateRange } from '@/lib/period';
import { toBroadcastApiPayload } from '@/lib/broadcast-payload';
import { normalizeWelcomeStatus, welcomeStatusPayload } from '@/lib/welcome-status';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ── Dashboard ──

export async function fetchStats(from?: string, to?: string): Promise<AdminStats> {
  if (USE_MOCK) return mockStats;
  const range = normalizeApiDateRange(from, to);
  const res = await api.get('/admin/stats', { params: range });
  const d = res.data;
  return {
    totalUsers: d.counters?.totalUsers ?? d.totalUsers ?? 0,
    onlineUsers: d.counters?.onlineUsers ?? d.onlineUsers ?? 0,
    bannedUsers: d.counters?.bannedUsers ?? d.bannedUsers ?? 0,
    messagesPeriod: d.counters?.messagesPeriod ?? d.messagesPeriod ?? 0,
    callsPeriod: d.counters?.callsPeriod ?? d.callsPeriod ?? 0,
    statusesPeriod: d.counters?.statusesPeriod ?? d.statusesPeriod ?? 0,
    registrations: (d.registrations || []).map((r: { d?: string; date?: string; n?: number; count?: number }) => ({
      date: r.date || r.d || '',
      count: r.count ?? r.n ?? 0,
    })),
    activity: (d.activity || []).map((r: { d?: string; date?: string; n?: number; count?: number }) => ({
      date: r.date || r.d || '',
      count: r.count ?? r.n ?? 0,
    })),
    topCountries: (d.byCountry || d.topCountries || []).map((c: { country?: string; pays?: string; n?: number; users?: number }) => ({
      pays: c.pays || c.country || '',
      users: c.users ?? c.n ?? 0,
    })),
    topUsers: (d.topUsers || []).map((u: { alanyaID?: number; nom?: string; pseudo?: string; avatar_url?: string; avatarUrl?: string; msgs?: number; messagesSent?: number; calls?: number; callsMade?: number; callsReceived?: number }) => ({
      alanyaID: u.alanyaID ?? 0,
      nom: u.nom || '',
      pseudo: u.pseudo || '',
      avatarUrl: u.avatarUrl || u.avatar_url || '',
      messagesSent: u.messagesSent ?? u.msgs ?? 0,
      callsMade: u.callsMade ?? u.calls ?? 0,
      callsReceived: u.callsReceived ?? 0,
    })),
  };
}

export async function fetchActivityFeed(): Promise<ActivityEntry[]> {
  if (USE_MOCK) return mockActivityFeed;
  const res = await api.get('/admin/activity');
  return res.data as ActivityEntry[];
}

// ── Analytics avancées ──

export async function fetchAnalytics(from?: string, to?: string): Promise<Analytics> {
  if (USE_MOCK) return mockAnalytics;
  const range = normalizeApiDateRange(from, to);
  const res = await api.get('/admin/analytics', { params: range });
  return res.data as Analytics;
}

export async function fetchTripStats(from?: string, to?: string): Promise<TripStats> {
  if (USE_MOCK) return mockTripStats;
  const range = normalizeApiDateRange(from, to);
  const res = await api.get('/admin/trips', { params: range });
  return res.data as TripStats;
}

export async function fetchTripRetention(): Promise<TripRetention> {
  if (USE_MOCK) return mockTripRetention;
  const res = await api.get('/admin/trips/retention');
  return res.data as TripRetention;
}

/**
 * Purge manuelle. `retention` applique la politique tout de suite ; `all`
 * efface la trace de tous les trajets clos. Le serveur ne touche jamais un
 * trajet en cours, quel que soit le scope.
 */
export async function runTripPurge(scope: 'retention' | 'all'): Promise<TripRetention> {
  if (USE_MOCK) return mockTripRetention;
  const res = await api.post('/admin/trips/retention/purge', { scope });
  return res.data as TripRetention;
}

// ── Purges de rétention ──

export async function fetchPurges(): Promise<PurgeSetting[]> {
  const res = await api.get('/admin/purges');
  return (res.data?.purges || []) as PurgeSetting[];
}

/** Active/désactive une purge, ou change ses durées de rétention. */
export async function updatePurge(
  name: string,
  payload: { enabled?: boolean; overrides?: Record<string, number | null> },
): Promise<PurgeSetting> {
  const res = await api.put(`/admin/purges/${name}`, payload);
  return res.data as PurgeSetting;
}

/**
 * Exécution immédiate. Volontairement indépendante de l'interrupteur : garder
 * la main pour purger ponctuellement tout en laissant le balayage automatique
 * coupé est l'usage attendu.
 */
export async function runPurgeNow(name: string): Promise<{ ok: boolean; runs: PurgeRun[] }> {
  const res = await api.post(`/admin/purges/${name}/run`, {});
  return res.data as { ok: boolean; runs: PurgeRun[] };
}

// ── Users ──

export async function fetchCountries(): Promise<Pays[]> {
  if (USE_MOCK) return mockCountries;
  const res = await api.get('/pays');
  return (res.data || []) as Pays[];
}

export async function fetchUsers(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  idPays?: string;
  accountType?: string;
  sort?: string;
  order?: string;
  /** `never` | `stale` | `recent` — état de sauvegarde du compte. */
  backup?: string;
}): Promise<UsersResponse> {
  if (USE_MOCK) return mockUsersResponse(params);
  const apiParams: Record<string, string | number | undefined> = { ...params };
  if (params.accountType != null && params.accountType !== '') {
    apiParams.account_type = params.accountType;
    delete apiParams.accountType;
  }
  const res = await api.get('/admin/users', { params: apiParams });
  return res.data;
}

export async function fetchUserDetail(id: number): Promise<UserDetail> {
  if (USE_MOCK) {
    return { ...mockUserDetail, alanyaID: id };
  }
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
}

export async function fetchUserActivity(id: number): Promise<UserActivity> {
  if (USE_MOCK) return mockUserActivity;
  const res = await api.get(`/admin/users/${id}/activity`);
  return res.data;
}

export async function fetchUserLogins(id: number): Promise<LoginEntry[]> {
  if (USE_MOCK) return mockLoginHistory;
  const res = await api.get(`/admin/users/${id}/logins`);
  return res.data;
}

export async function banUser(id: number, reason?: string): Promise<void> {
  if (USE_MOCK) return;
  await api.post(`/admin/users/${id}/ban`, { reason });
}

export async function unbanUser(id: number): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/admin/users/${id}/ban`);
}

export async function setUserRole(id: number, typeCompte: number): Promise<void> {
  if (USE_MOCK) return;
  await api.put(`/admin/users/${id}/role`, { type_compte: typeCompte });
}

export async function deleteUser(id: number): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/admin/users/${id}`);
}

export async function createUser(payload: import('@/types').CreateUserPayload): Promise<UserDetail> {
  if (USE_MOCK) {
    return {
      ...mockUserDetail,
      nom: payload.nom,
      pseudo: payload.pseudo,
      alanyaPhone: payload.alanyaPhone || '12345678',
      email: payload.email || '',
    };
  }
  const res = await api.post('/admin/users', {
    nom: payload.nom,
    pseudo: payload.pseudo,
    password: payload.password,
    email: payload.email,
    alanyaPhone: payload.alanyaPhone,
    generateLength: payload.generateLength,
    idPays: payload.idPays,
    avatarGender: payload.avatarGender,
    type_compte: payload.type_compte,
    account_type: payload.account_type,
  });
  return res.data;
}

/**
 * Socle de compte. Réservé au super-admin côté serveur, qui refuse en 409
 * de donner un genre business/officiel à un compte disposant de droits
 * d'administration.
 */
export async function setUserSocle(
  id: number,
  payload: import('@/types').SetUserSoclePayload,
): Promise<void> {
  if (USE_MOCK) return;
  await api.put(`/admin/users/${id}/socle`, payload);
}

export async function updateUserPhone(id: number, alanyaPhone: string): Promise<void> {
  if (USE_MOCK) return;
  await api.put(`/admin/users/${id}/phone`, { alanyaPhone });
}

export async function fetchReservedAlanyaPhones(
  params: import('@/types').ReservedAlanyaPhonesParams = {},
): Promise<import('@/types').PaginatedReservedAlanyaPhones> {
  const mockItems: import('@/types').ReservedAlanyaPhone[] = [
    { id: 1, phoneCanonical: '000', label: 'Réservé 3 ch.', createdBy: null, createdAt: new Date().toISOString(), isUsed: false },
    { id: 2, phoneCanonical: '0000', label: 'Réservé 4 ch.', createdBy: null, createdAt: new Date().toISOString(), isUsed: true, usedByAlanyaId: 4, usedByNom: 'Sophie L.', usedByPseudo: 'sophiel' },
    { id: 3, phoneCanonical: '00000000', label: 'Réservé 8 ch.', createdBy: null, createdAt: new Date().toISOString(), isUsed: false },
  ];

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  if (USE_MOCK) {
    let filtered = [...mockItems];
    const q = params.q?.trim();
    if (q) {
      const digits = q.replace(/\D/g, '');
      filtered = filtered.filter((item) =>
        digits
          ? item.phoneCanonical.startsWith(digits)
          : item.label.toLowerCase().includes(q.toLowerCase()),
      );
    }
    if (params.available === '1') filtered = filtered.filter((item) => !item.isUsed);
    if (params.available === '0') filtered = filtered.filter((item) => item.isUsed);
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  const res = await api.get('/admin/reserved-alanya-phones', { params });
  const data = res.data || {};

  // Ancienne API (tableau brut) : ne pas charger 100k+ lignes d'un coup
  if (Array.isArray(data)) {
    const start = (page - 1) * limit;
    const slice = data.slice(start, start + limit);
    return {
      items: slice.map((r: Record<string, unknown>) => mapReservedRow(r)),
      total: data.length,
      page,
      limit,
    };
  }

  const rows = data.items || [];

  return {
    items: rows.map((r: Record<string, unknown>) => mapReservedRow(r)),
    total: Number(data.total ?? rows.length),
    page: Number(data.page ?? page),
    limit: Number(data.limit ?? limit),
    patternSuggestion: mapPatternSuggestion(data.pattern_suggestion),
  };
}

function mapPatternSuggestion(
  raw: unknown,
): import('@/types').PatternSuggestion | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const phone =
    (r.phone_canonical as string) || (r.phoneCanonical as string) || '';
  if (!phone) return null;
  return {
    phoneCanonical: phone,
    label: (r.label as string) || 'Pattern réservé',
    source: 'pattern',
    isUsed: Boolean(r.isUsed ?? r.is_used),
    assignable: Boolean(r.assignable ?? !r.is_used),
  };
}

export async function checkAssignablePhone(
  phone: string,
): Promise<import('@/types').AssignablePhoneCheck> {
  if (USE_MOCK) {
    const canonical = phone.replace(/\D/g, '');
    const isPattern =
      canonical.length === 3 ||
      canonical.length === 4 ||
      (canonical.length === 8 &&
        canonical[0] === canonical[1] &&
        canonical[2] === canonical[3] &&
        canonical[4] === canonical[5] &&
        canonical[6] === canonical[7]);
    return {
      phoneCanonical: canonical,
      tier: canonical.length,
      isPatternReserved: isPattern,
      inReservedTable: false,
      isTaken: false,
      assignable: true,
      reason: null,
      source: isPattern ? 'pattern' : 'standard',
      hint: isPattern ? 'Pattern réservé — attribution directe autorisée' : null,
    };
  }

  const res = await api.get('/admin/alanya-phones/check-assignable', {
    params: { phone },
  });
  const d = res.data || {};
  return {
    phoneCanonical: d.phone_canonical as string,
    tier: Number(d.tier),
    isPatternReserved: Boolean(d.is_pattern_reserved),
    inReservedTable: Boolean(d.in_reserved_table),
    isTaken: Boolean(d.is_taken),
    assignable: Boolean(d.assignable),
    reason: (d.reason as string) ?? null,
    source: d.source as 'pattern' | 'table' | 'standard',
    hint: (d.hint as string) ?? null,
  };
}

function mapReservedRow(r: Record<string, unknown>): import('@/types').ReservedAlanyaPhone {
  return {
      id: r.id as number,
      phoneCanonical: (r.phone_canonical as string) || (r.phoneCanonical as string) || '',
      label: r.label as string,
      createdBy: (r.created_by as number) ?? null,
      createdAt: (r.created_at as string) || '',
      createdByNom: (r.created_by_nom as string) ?? null,
      isUsed: Boolean(r.isUsed ?? r.is_used),
      usedByAlanyaId: (r.usedByAlanyaId as number) ?? (r.used_by_alanya_id as number) ?? null,
      usedByNom: (r.usedByNom as string) ?? (r.used_by_nom as string) ?? null,
      usedByPseudo: (r.usedByPseudo as string) ?? (r.used_by_pseudo as string) ?? null,
  };
}

export async function addReservedAlanyaPhone(phone: string, label: string): Promise<void> {
  if (USE_MOCK) return;
  await api.post('/admin/reserved-alanya-phones', { phone, label });
}

export async function removeReservedAlanyaPhone(phone: string): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/admin/reserved-alanya-phones/${encodeURIComponent(phone)}`);
}

// ── Groups ──

export async function fetchGroups(): Promise<Group[]> {
  if (USE_MOCK) return mockGroups;
  const res = await api.get('/admin/groups');
  return (res.data || []).map((g: Record<string, unknown>) => ({
    conversID: g.conversID as number,
    groupName: (g.GroupName as string) || 'Groupe',
    groupPhoto: typeof g.groupPhoto === 'string' && g.groupPhoto.startsWith('http') ? g.groupPhoto : '',
    lastMessage: (g.lastMessage as string) || '',
    lastMessageAt: g.lastMessageAt as string,
    members: (g.members as number) || 0,
    createdAt: g.createdAt as string,
  }));
}

export async function fetchGroupDetail(id: number): Promise<GroupDetail> {
  if (USE_MOCK) return mockGroupDetail(id);
  const res = await api.get(`/admin/groups/${id}`);
  const d = res.data as Record<string, unknown>;
  return {
    conversID: d.conversID as number,
    groupName: (d.GroupName as string) || 'Groupe',
    groupPhoto: typeof d.groupPhoto === 'string' && d.groupPhoto.startsWith('http') ? d.groupPhoto : null,
    lastMessage: (d.lastMessage as string) || null,
    lastMessageAt: (d.lastMessageAt as string) || null,
    memberCount: (d.memberCount as number) ?? 0,
    messageCount: (d.messageCount as number) ?? 0,
    createdAt: (d.createdAt as string) || null,
    members: ((d.members as Record<string, unknown>[]) || []).map((m) => ({
      alanyaID: m.alanyaID as number,
      nom: (m.nom as string) || '',
      pseudo: (m.pseudo as string) || '',
      avatarUrl: (m.avatarUrl as string) || null,
      alanyaPhone: (m.alanyaPhone as string) || '',
      isOnline: !!m.isOnline,
      lastSeen: (m.lastSeen as string) || null,
      typeCompte: (m.typeCompte as number) ?? 0,
      joinedAt: (m.joinedAt as string) || null,
    })),
  };
}

export async function deleteGroup(id: number): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/admin/groups/${id}`);
}

// ── Meetings ──
// Note : api.ts transforme déjà les clés snake_case → camelCase, on lit donc
// directement organiserNom / startTime / typeMedia / createdAt.

export async function fetchMeetings(): Promise<Meeting[]> {
  if (USE_MOCK) return mockMeetings;
  const res = await api.get('/admin/meetings');
  return (res.data || []).map((m: Record<string, unknown>) => ({
    idMeeting: m.idMeeting as number,
    idOrganiser: m.idOrganiser as number,
    organiserNom: (m.organiserNom as string) || '',
    organiserPseudo: (m.organiserPseudo as string) || '',
    organiserAvatar: (m.organiserAvatar as string) || '',
    objet: (m.objet as string) || '',
    room: (m.room as string) || '',
    startTime: m.startTime as string,
    duree: (m.duree as number) || 0,
    isEnd: (m.isEnd as number) ?? 0,
    typeMedia: (m.typeMedia as number) ?? 0,
    participants: (m.participants as number) || 0,
    createdAt: m.createdAt as string,
  }));
}

export async function endMeeting(id: number): Promise<void> {
  if (USE_MOCK) return;
  await api.post(`/admin/meetings/${id}/end`);
}

export async function deleteMeeting(id: number): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/admin/meetings/${id}`);
}

// ── Medias ──

export async function fetchMediaItems(): Promise<MediaItem[]> {
  if (USE_MOCK) return mockMediaItems;
  const res = await api.get('/admin/media');
  return res.data;
}

export async function deleteMedia(id: number): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/admin/media/${id}`);
}

// ── Settings ──

const DEFAULT_SETTINGS: AppSettings = {
  maintenance: false,
  appName: 'Alanya',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
};

export async function fetchSettings(): Promise<AppSettings> {
  if (USE_MOCK) return DEFAULT_SETTINGS;
  const res = await api.get('/admin/settings');
  return res.data as AppSettings;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  if (USE_MOCK) return { ...DEFAULT_SETTINGS, ...patch };
  const res = await api.put('/admin/settings', patch);
  return res.data as AppSettings;
}

// ── Upload ──

export async function uploadMedia(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ url: string; filename: string; originalName: string; mimetype: string; size: number }> {
  if (USE_MOCK) {
    // Simulate upload with fake progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 50));
      onProgress?.(i);
    }
    const ext = file.name.split(".").pop() || "bin";
    const filename = `mock_${Date.now()}.${ext}`;
    return {
      url: URL.createObjectURL(file),
      filename,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
    };
  }
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data;
}

// ── Broadcasts ──

export async function fetchBroadcasts(params: {
  page?: number;
  limit?: number;
  search?: string;
  kind?: string;
  type?: string;
  status?: string;
  idPays?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: string;
} = {}): Promise<BroadcastsResponse> {
  const { from, to, ...rest } = params;
  const apiParams: Record<string, string | number | undefined> = { ...rest };
  if (from || to) {
    const range = normalizeApiDateRange(from, to);
    apiParams.from = range.from;
    apiParams.to = range.to;
  }
  const res = await api.get('/admin/broadcasts', { params: apiParams });
  return res.data as BroadcastsResponse;
}

export async function fetchBroadcast(id: number): Promise<Broadcast> {
  const res = await api.get(`/admin/broadcasts/${id}`);
  return res.data as Broadcast;
}

export async function estimateBroadcast(criteria: import('@/types').BroadcastCriteria): Promise<BroadcastEstimateResult> {
  const res = await api.post('/admin/broadcasts/estimate', { criteria });
  return res.data as BroadcastEstimateResult;
}

export async function createBroadcast(data: BroadcastFormData): Promise<Broadcast | { scheduled: true; clientId: string; scheduledAt: string; estimate: number }> {
  const res = await api.post('/admin/broadcasts', toBroadcastApiPayload(data));
  return res.data;
}

export async function cancelScheduledBroadcast(jobId: number): Promise<void> {
  await api.delete(`/admin/broadcasts/scheduled/${jobId}`);
}

export async function fetchVilles(idPays: number, search = ''): Promise<Ville[]> {
  const res = await api.get('/admin/villes', { params: { idPays, search } });
  return (res.data?.items || []) as Ville[];
}

/**
 * Le compte officiel est unique : on lit l'unique, on ne liste pas.
 * Renvoie null tant qu'il n'a pas été créé — les écrans s'en servent pour
 * afficher un état vide plutôt qu'un formulaire qui échouerait à l'envoi.
 */
export async function fetchOfficialAccount(): Promise<import('@/types').User | null> {
  const res = await api.get('/admin/official-account');
  return (res.data || null) as import('@/types').User | null;
}

/** Création sans aucune saisie : l'identité est imposée par le serveur. */
export async function createOfficialAccount(): Promise<import('@/types').User> {
  const res = await api.post('/admin/official-account');
  return res.data as import('@/types').User;
}

// ── Message de bienvenue ──

export async function fetchWelcomeConfig(): Promise<import('@/types').WelcomeAdminState> {
  const res = await api.get('/admin/welcome');
  return res.data as import('@/types').WelcomeAdminState;
}

export async function saveWelcomeDraft(blocks: import('@/types').WelcomeBlock[]): Promise<import('@/types').WelcomeConfig> {
  const res = await api.put('/admin/welcome/draft', { blocks });
  return res.data as import('@/types').WelcomeConfig;
}

export async function publishWelcomeConfig(): Promise<import('@/types').WelcomeConfig> {
  const res = await api.post('/admin/welcome/publish');
  return res.data as import('@/types').WelcomeConfig;
}

export interface WelcomeBackfillResult {
  queued: boolean;
  pending: number;
  /** Pourquoi rien n'a été mis en file : NOTHING_TO_DO | ALREADY_RUNNING. */
  reason?: string;
}

export async function backfillWelcomeMessages(): Promise<WelcomeBackfillResult> {
  const res = await api.post('/admin/welcome/backfill');
  return res.data as WelcomeBackfillResult;
}

/**
 * Statut de bienvenue — réglage global : le PUT prend effet immédiatement,
 * il ne transite pas par le brouillon ni par « Publier ».
 */
export async function fetchWelcomeStatus(): Promise<import('@/types').WelcomeStatusConfig> {
  const res = await api.get('/admin/welcome/status');
  return normalizeWelcomeStatus(res.data);
}

export async function saveWelcomeStatus(
  config: import('@/types').WelcomeStatusConfig,
): Promise<import('@/types').WelcomeStatusConfig> {
  const res = await api.put('/admin/welcome/status', welcomeStatusPayload(config));
  return normalizeWelcomeStatus(res.data);
}

// ── Assistance éditoriale ──
//
// N'écrit rien : ces routes remplissent le formulaire, la publication reste
// gardée par `welcome.*` et `broadcasts.send`. En mode maquette elles ne sont
// pas simulées — un faux texte traduit induirait en erreur sur la qualité
// réelle, qui est justement ce qu'on veut juger.

export async function fetchAiStatus(): Promise<import('@/types').AiStatus> {
  if (USE_MOCK) return { enabled: false, model: null };
  const res = await api.get('/admin/ai/status');
  return res.data as import('@/types').AiStatus;
}

export async function translateContent(params: {
  content: string;
  kind: import('@/types').AiContentKind;
  sourceLocale?: string;
  targets?: string[];
}): Promise<import('@/types').AiTranslateResult> {
  const res = await api.post('/admin/ai/translate', params);
  return res.data as import('@/types').AiTranslateResult;
}

export async function reviewContent(params: {
  translations: import('@/lib/content-locales').Translations;
  kind: import('@/types').AiContentKind;
}): Promise<import('@/types').AiReviewResult> {
  const res = await api.post('/admin/ai/review', params);
  return res.data as import('@/types').AiReviewResult;
}

// ── Admin Profile ──

const mockAdminProfile: AdminProfile = {
  alanyaID: 42,
  nom: "Chris Admin",
  pseudo: "chrisadmin",
  email: "admin@talky.app",
  alanyaPhone: "00000000",
  avatarUrl: "",
  typeCompte: 2,
  // Fixture de développement (NEXT_PUBLIC_USE_MOCK) : le jeu réel est calculé
  // par le serveur dans `constants/adminRoles.js`. Recopié ici pour que le mode
  // maquette n'affiche pas une interface amputée ; il peut dériver, et c'est
  // sans conséquence — le vrai chemin est `GET /admin/me`.
  permissions: [
    "ai.editorial",
    "analytics.export", "audit.read", "broadcasts.cancel", "broadcasts.read",
    "broadcasts.send", "groups.delete", "groups.read", "media.delete",
    "media.read", "meetings.delete", "meetings.end", "meetings.read",
    "official.create", "official.read", "phones.read", "phones.release",
    "phones.reserve", "profile.password", "profile.read", "profile.update",
    "purges.read", "purges.run", "purges.settings", "settings.read",
    "settings.write", "stats.read", "trips.purge", "trips.read", "users.ban",
    "users.create", "users.delete", "users.export", "users.phone", "users.read",
    "users.role", "users.socle", "users.unban", "villes.read",
    "welcome.backfill", "welcome.draft", "welcome.publish", "welcome.read",
    "welcome.status",
  ],
  paysLibelle: "Côte d'Ivoire",
  createdAt: "2026-01-12T10:00:00Z",
  lastSeen: new Date().toISOString(),
};

export async function fetchAdminProfile(): Promise<AdminProfile> {
  if (USE_MOCK) return mockAdminProfile;
  const res = await api.get('/admin/me');
  return res.data as AdminProfile;
}

export async function updateAdminProfile(data: Partial<AdminProfile>): Promise<AdminProfile> {
  if (USE_MOCK) {
    Object.assign(mockAdminProfile, data);
    return { ...mockAdminProfile };
  }
  const res = await api.put('/admin/me', data);
  return res.data as AdminProfile;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (USE_MOCK) return;
  await api.put('/admin/me/password', { currentPassword, newPassword });
}

/* ── Journal des actions administrateur ─────────────────────────────────── */

/**
 * Le serveur renvoie les colonnes telles quelles ; la conversion vit ici plutôt
 * que dans le contrôleur, comme pour les autres ressources du panneau.
 */
/**
 * Forme brute d'une ressource telle qu'elle arrive de l'API.
 *
 * Les clés sont celles du type final — `api` applique déjà `snakeToCamel` dans
 * son `transformResponse` — mais les valeurs restent `unknown` : un entier peut
 * arriver en chaîne, un booléen en 0/1.
 *
 * L'intérêt est de fermer une porte : avec `Record<string, unknown>`, lire
 * `row.target_type` compilait sans broncher et renvoyait `undefined` à
 * l'exécution. Ici, c'est une erreur de compilation. C'est exactement le bug
 * qui a rendu les écrans Audit et Signalements vides à leur première écriture.
 */
type Wire<T> = { [K in keyof T]?: unknown };

function toAuditEntry(row: Wire<import('@/types').AuditEntry>): import('@/types').AuditEntry {
  // Les clés arrivent déjà en camelCase : `api` applique `snakeToCamel` dans son
  // `transformResponse`. Ne restent ici que les conversions de type.
  return {
    id: Number(row.id),
    action: String(row.action ?? ''),
    route: String(row.route ?? ''),
    targetType: (row.targetType as string) ?? null,
    targetId: row.targetId != null ? String(row.targetId) : null,
    reason: (row.reason as string) ?? null,
    ip: (row.ip as string) ?? null,
    statusCode: Number(row.statusCode ?? 0),
    createdAt: String(row.createdAt ?? ''),
    adminId: row.adminId != null ? Number(row.adminId) : null,
    adminNom: (row.adminNom as string) ?? null,
    adminEmail: (row.adminEmail as string) ?? null,
  };
}

export interface AuditQuery {
  adminId?: number;
  action?: string;
  targetType?: string;
  targetId?: string | number;
  before?: number;
  limit?: number;
}

export async function fetchAudit(query: AuditQuery = {}): Promise<import('@/types').AuditEntry[]> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== '') params[key] = String(value);
  }
  const res = await api.get('/admin/audit', { params });
  return (Array.isArray(res.data) ? res.data : []).map(toAuditEntry);
}

export async function fetchAuditActions(): Promise<import('@/types').AuditActionCount[]> {
  const res = await api.get('/admin/audit/actions');
  return (Array.isArray(res.data) ? res.data : []).map((row: Wire<import('@/types').AuditActionCount>) => ({
    action: String(row.action ?? ''),
    n: Number(row.n ?? 0),
    derniere: (row.derniere as string) ?? null,
  }));
}

/* ── Sauvegardes du parc ────────────────────────────────────────────────── */

export async function fetchBackupOverview(): Promise<import('@/types').BackupOverview> {
  const res = await api.get('/admin/backup/overview');
  const d = res.data ?? {};
  return {
    staleDays: Number(d.staleDays ?? 30),
    comptes: Number(d.comptes ?? 0),
    avecSauvegarde: Number(d.avecSauvegarde ?? 0),
    recentes: Number(d.recentes ?? 0),
    perimees: Number(d.perimees ?? 0),
    jamais: Number(d.jamais ?? 0),
    octetsTotal: Number(d.octetsTotal ?? 0),
    derniere: (d.derniere as string) ?? null,
    couverture: Number(d.couverture ?? 0),
  };
}

export async function fetchBackupKeyUsage(): Promise<import('@/types').BackupKeyUsage[]> {
  const res = await api.get('/admin/backup/key-usage');
  return (Array.isArray(res.data) ? res.data : []).map((r: Record<string, unknown>) => ({
    kid: Number(r.kid ?? 0),
    comptes: Number(r.comptes ?? 0),
    derniere: (r.derniere as string) ?? null,
  }));
}

/* ── Clés de sauvegarde ─────────────────────────────────────────────────── */

export interface BackupKeyAccessQuery {
  alanyaId?: number;
  outcome?: 'servie' | 'refusee';
  since?: string;
  limit?: number;
}

function toBackupKeyAccess(
  row: Wire<import('@/types').BackupKeyAccess>,
): import('@/types').BackupKeyAccess {
  // camelCase déjà appliqué par `transformResponse` — cf. toAuditEntry.
  return {
    id: Number(row.id),
    alanyaId: Number(row.alanyaId ?? 0),
    kid: row.kid != null ? Number(row.kid) : null,
    outcome: (row.outcome as 'servie' | 'refusee') ?? 'servie',
    reason: (row.reason as string) ?? null,
    ip: (row.ip as string) ?? null,
    deviceId: (row.deviceId as string) ?? null,
    userAgent: (row.userAgent as string) ?? null,
    createdAt: String(row.createdAt ?? ''),
    compteNom: (row.compteNom as string) ?? null,
    comptePhone: (row.comptePhone as string) ?? null,
  };
}

export async function fetchBackupKeyAccess(
  query: BackupKeyAccessQuery = {},
): Promise<import('@/types').BackupKeyAccess[]> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== '') params[key] = String(value);
  }
  const res = await api.get('/admin/backup/key-access', { params });
  return (Array.isArray(res.data) ? res.data : []).map(toBackupKeyAccess);
}

export async function fetchBackupKeyAccessSummary(
  days = 7,
): Promise<import('@/types').BackupKeyAccessSummary> {
  const res = await api.get('/admin/backup/key-access/summary', {
    params: { days: String(days) },
  });
  const d = res.data ?? {};
  return {
    days: Number(d.days ?? days),
    total: Number(d.total ?? 0),
    refus: Number(d.refus ?? 0),
    comptes: Number(d.comptes ?? 0),
    adresses: Number(d.adresses ?? 0),
    derniere: (d.derniere as string) ?? null,
  };
}

/* ── File de modération ─────────────────────────────────────────────────── */

function toReport(row: Wire<import('@/types').Report>): import('@/types').Report {
  // camelCase déjà appliqué par `transformResponse` — cf. toAuditEntry.
  return {
    id: Number(row.id),
    targetType: (row.targetType as 'message' | 'user') ?? 'user',
    targetMsgId: row.targetMsgId != null ? Number(row.targetMsgId) : null,
    targetUserId: row.targetUserId != null ? Number(row.targetUserId) : null,
    reason: String(row.reason ?? ''),
    note: (row.note as string) ?? null,
    state: (row.state as import('@/types').ReportState) ?? 'open',
    createdAt: String(row.createdAt ?? ''),
    reporterId: row.reporterId != null ? Number(row.reporterId) : null,
    reporterNom: (row.reporterNom as string) ?? null,
    targetNom: (row.targetNom as string) ?? null,
    targetExclus: Boolean(row.targetExclus),
    msgSenderId: row.msgSenderId != null ? Number(row.msgSenderId) : null,
    msgSenderNom: (row.msgSenderNom as string) ?? null,
    msgType: row.msgType != null ? Number(row.msgType) : null,
    msgContent: (row.msgContent as string) ?? null,
    msgDeleted: Boolean(row.msgDeleted),
    msgSentAt: (row.msgSentAt as string) ?? null,
    actions: Number(row.actions ?? 0),
  };
}

export interface ReportsParams {
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchReports(
  params: ReportsParams = {},
): Promise<import('@/types').ReportsResponse> {
  const res = await api.get('/admin/reports', {
    params: {
      state: params.state || undefined,
      search: params.search?.trim() || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  // Un serveur d'avant la pagination répond par un tableau nu. L'accepter
  // évite que l'écran s'affiche vide si le panneau est déployé avant le
  // backend — l'ordre de déploiement cesse d'être une condition.
  if (Array.isArray(res.data)) {
    const items = res.data.map(toReport);
    return {
      items,
      total: items.length,
      open: items.filter((r) => r.state === 'open').length,
      page: 1,
      limit: items.length || 20,
    };
  }

  const items = (Array.isArray(res.data?.items) ? res.data.items : []).map(toReport);
  return {
    items,
    total: Number(res.data?.total ?? items.length),
    open: Number(res.data?.open ?? 0),
    page: Number(res.data?.page ?? 1),
    limit: Number(res.data?.limit ?? 20),
  };
}

export async function fetchReportActions(id: number): Promise<import('@/types').ReportAction[]> {
  const res = await api.get(`/admin/reports/${id}/actions`);
  return (Array.isArray(res.data) ? res.data : []).map((row: Wire<import('@/types').ReportAction>) => ({
    id: Number(row.id),
    action: String(row.action ?? ''),
    note: (row.note as string) ?? null,
    createdAt: String(row.createdAt ?? ''),
    adminId: row.adminId != null ? Number(row.adminId) : null,
    adminNom: (row.adminNom as string) ?? null,
  }));
}

export async function postReportAction(id: number, action: string, note?: string): Promise<void> {
  await api.post(`/admin/reports/${id}/actions`, { action, note });
}
