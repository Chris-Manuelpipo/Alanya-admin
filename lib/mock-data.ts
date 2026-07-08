import { AdminStats, Analytics, ActivityEntry, UsersResponse, UserDetail, UserActivity, LoginEntry, Group, GroupDetail, Meeting, MediaItem, AppSettings, Pays } from '@/types';
import { mockStats, mockActivityFeed } from '@/mock/stats';
import { mockAnalytics } from '@/mock/analytics';
import { mockUsersResponse, mockUserDetail, mockUserActivity, mockLoginHistory } from '@/mock/users';
import { mockGroups, mockGroupDetail } from '@/mock/groups';
import { mockMeetings } from '@/mock/meetings';
import { mockMediaItems } from '@/mock/medias';
import { mockCountries } from '@/mock/countries';
import { api } from './api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ── Dashboard ──

export async function fetchStats(from?: string, to?: string): Promise<AdminStats> {
  if (USE_MOCK) return mockStats;
  const res = await api.get('/admin/stats', { params: { from, to } });
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
  // Les clés backend sont déjà en camelCase → le transform snake→camel
  // (lib/api.ts) les laisse intactes, on peut retourner res.data tel quel.
  const res = await api.get('/admin/analytics', { params: { from, to } });
  return res.data as Analytics;
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
  sort?: string;
  order?: string;
}): Promise<UsersResponse> {
  if (USE_MOCK) return mockUsersResponse(params);
  const res = await api.get('/admin/users', { params });
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
  });
  return res.data;
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
