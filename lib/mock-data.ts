import { AdminStats, Analytics, ActivityEntry, UsersResponse, UserDetail, UserActivity, LoginEntry, Group, GroupDetail, Meeting, MediaItem, AppSettings } from '@/types';
import { mockStats, mockActivityFeed } from '@/mock/stats';
import { mockAnalytics } from '@/mock/analytics';
import { mockUsersResponse, mockUserDetail, mockUserActivity, mockLoginHistory } from '@/mock/users';
import { mockGroups, mockGroupDetail } from '@/mock/groups';
import { mockMeetings } from '@/mock/meetings';
import { mockMediaItems } from '@/mock/medias';
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
