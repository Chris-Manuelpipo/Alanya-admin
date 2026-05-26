import { User, UsersResponse, UserDetail, UserActivity, LoginEntry } from '@/types';

export const mockUsers: User[] = [
  { alanyaID: 1, nom: 'Jean Dupont', pseudo: 'jeand', alanyaPhone: '+33612345678', email: 'jean@example.com', idPays: 1, avatarUrl: '', typeCompte: 0, isOnline: true, lastSeen: new Date().toISOString(), exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-01-15T08:30:00Z', paysLibelle: 'France' },
  { alanyaID: 2, nom: 'Marie K.', pseudo: 'mariek', alanyaPhone: '+33623456789', email: 'marie@example.com', idPays: 1, avatarUrl: '', typeCompte: 0, isOnline: true, lastSeen: new Date().toISOString(), exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-02-20T14:00:00Z', paysLibelle: 'France' },
  { alanyaID: 3, nom: 'Paul B.', pseudo: 'paulb', alanyaPhone: '+33634567890', email: 'paul@example.com', idPays: 2, avatarUrl: '', typeCompte: 0, isOnline: false, lastSeen: '2026-05-25T10:30:00Z', exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-03-10T09:15:00Z', paysLibelle: "Côte d'Ivoire" },
  { alanyaID: 4, nom: 'Sophie L.', pseudo: 'sophiel', alanyaPhone: '+33645678901', email: 'sophie@example.com', idPays: 1, avatarUrl: '', typeCompte: 1, isOnline: true, lastSeen: new Date().toISOString(), exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-01-05T11:00:00Z', paysLibelle: 'France' },
  { alanyaID: 5, nom: 'Lucas M.', pseudo: 'lucasm', alanyaPhone: '+33656789012', email: 'lucas@example.com', idPays: 3, avatarUrl: '', typeCompte: 0, isOnline: false, lastSeen: '2026-05-24T18:45:00Z', exclus: true, excludeAt: '2026-05-20T08:00:00Z', excludeReason: 'Spam', createdAt: '2025-04-01T16:30:00Z', paysLibelle: 'Cameroun' },
  { alanyaID: 6, nom: 'Emma R.', pseudo: 'emmar', alanyaPhone: '+33667890123', email: 'emma@example.com', idPays: 4, avatarUrl: '', typeCompte: 2, isOnline: true, lastSeen: new Date().toISOString(), exclus: false, excludeAt: null, excludeReason: null, createdAt: '2024-12-01T07:00:00Z', paysLibelle: 'Sénégal' },
  { alanyaID: 7, nom: 'Thomas W.', pseudo: 'thomasw', alanyaPhone: '+33678901234', email: 'thomas@example.com', idPays: 5, avatarUrl: '', typeCompte: 0, isOnline: false, lastSeen: '2026-05-23T22:10:00Z', exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-06-15T13:45:00Z', paysLibelle: 'Maroc' },
  { alanyaID: 8, nom: 'Camille N.', pseudo: 'camillen', alanyaPhone: '+33689012345', email: 'camille@example.com', idPays: 6, avatarUrl: '', typeCompte: 0, isOnline: true, lastSeen: new Date().toISOString(), exclus: true, excludeAt: '2026-05-22T09:00:00Z', excludeReason: 'Comportement inapproprié', createdAt: '2025-05-10T12:00:00Z', paysLibelle: 'Algérie' },
  { alanyaID: 9, nom: 'Hugo P.', pseudo: 'hugop', alanyaPhone: '+33690123456', email: 'hugo@example.com', idPays: 7, avatarUrl: '', typeCompte: 0, isOnline: false, lastSeen: '2026-05-22T15:20:00Z', exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-07-20T10:30:00Z', paysLibelle: 'Tunisie' },
  { alanyaID: 10, nom: 'Léa D.', pseudo: 'lead', alanyaPhone: '+33601234567', email: 'lea@example.com', idPays: 8, avatarUrl: '', typeCompte: 0, isOnline: true, lastSeen: new Date().toISOString(), exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-08-05T17:00:00Z', paysLibelle: 'Belgique' },
  { alanyaID: 11, nom: 'Nicolas R.', pseudo: 'nicolasr', alanyaPhone: '+33611223344', email: 'nicolas@example.com', idPays: 9, avatarUrl: '', typeCompte: 0, isOnline: false, lastSeen: '2026-05-21T11:00:00Z', exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-09-12T08:45:00Z', paysLibelle: 'Canada' },
  { alanyaID: 12, nom: 'Julie M.', pseudo: 'juliem', alanyaPhone: '+33622334455', email: 'julie@example.com', idPays: 10, avatarUrl: '', typeCompte: 0, isOnline: true, lastSeen: new Date().toISOString(), exclus: false, excludeAt: null, excludeReason: null, createdAt: '2025-10-01T19:30:00Z', paysLibelle: 'Suisse' },
];

export const mockUserDetail: UserDetail = {
  alanyaID: 1,
  nom: 'Jean Dupont',
  pseudo: 'jeand',
  alanyaPhone: '+33612345678',
  email: 'jean@example.com',
  idPays: 1,
  avatarUrl: '',
  typeCompte: 0,
  isOnline: true,
  lastSeen: new Date().toISOString(),
  exclus: false,
  excludeAt: null,
  excludeReason: null,
  createdAt: '2025-01-15T08:30:00Z',
  paysLibelle: 'France',
  fcmToken: 'fcm_token_abc123',
  deviceID: 'device_xyz789',
  paysPrefix: '+33',
};

export const mockUserActivity: UserActivity = {
  messagesSent: 1234,
  conversations: 45,
  callsMade: 56,
  callsReceived: 42,
  statusesPublished: 28,
};

export const mockLoginHistory: LoginEntry[] = [
  { idAccess: 101, dateLogin: '2026-05-26T09:15:00Z', os_system: 'Android 14', device: 'Samsung Galaxy S24', ipAdress: '192.168.1.42' },
  { idAccess: 100, dateLogin: '2026-05-25T20:30:00Z', os_system: 'iOS 18', device: 'iPhone 16 Pro', ipAdress: '10.0.0.15' },
  { idAccess: 99, dateLogin: '2026-05-25T14:00:00Z', os_system: 'Windows 11', device: 'Chrome 125', ipAdress: '192.168.1.42' },
  { idAccess: 98, dateLogin: '2026-05-24T18:45:00Z', os_system: 'Android 13', device: 'Pixel 8', ipAdress: '172.16.0.8' },
  { idAccess: 97, dateLogin: '2026-05-24T10:00:00Z', os_system: 'macOS 15', device: 'Safari 18', ipAdress: '192.168.1.42' },
];

export function mockUsersResponse(params: { search?: string; status?: string; page?: number; limit?: number; idPays?: string; sort?: string; order?: string }): UsersResponse {
  let items = [...mockUsers];
  const page = params.page || 1;
  const limit = params.limit || 20;

  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(u => u.nom.toLowerCase().includes(s) || u.pseudo.toLowerCase().includes(s) || u.alanyaPhone.includes(s));
  }
  if (params.status === 'online') items = items.filter(u => u.isOnline);
  if (params.status === 'banned') items = items.filter(u => u.exclus);
  if (params.status === 'admin') items = items.filter(u => u.typeCompte >= 1);
  if (params.idPays) items = items.filter(u => u.idPays === parseInt(params.idPays!));

  const total = items.length;
  const start = (page - 1) * limit;
  items = items.slice(start, start + limit);

  return { items, total, page, limit };
}
