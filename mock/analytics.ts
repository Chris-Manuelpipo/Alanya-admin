import { Analytics } from '@/types';

// Heatmap mock : 7 jours × 24 h, pics en journée/soirée
const mockHeatmap = (() => {
  const cells: { dow: number; hour: number; count: number }[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const peak = hour >= 8 && hour <= 22 ? 1 : 0.15;
      const weekend = dow === 0 || dow === 6 ? 1.2 : 1;
      cells.push({
        dow,
        hour,
        count: Math.round(Math.random() * 120 * peak * weekend),
      });
    }
  }
  return cells;
})();

export const mockAnalytics: Analytics = {
  messagesByType: [
    { type: 0, label: 'Texte', count: 38120 },
    { type: 1, label: 'Image', count: 5421 },
    { type: 2, label: 'Vidéo', count: 1203 },
    { type: 3, label: 'Audio', count: 2890 },
    { type: 4, label: 'Fichier', count: 712 },
    { type: 5, label: 'Localisation', count: 246 },
  ],
  messagesByDay: [
    { date: '2026-05-28', count: 6120 },
    { date: '2026-05-29', count: 6890 },
    { date: '2026-05-30', count: 7240 },
    { date: '2026-05-31', count: 5980 },
    { date: '2026-06-01', count: 6510 },
    { date: '2026-06-02', count: 8120 },
    { date: '2026-06-03', count: 7430 },
  ],
  calls: {
    total: 8123,
    audio: 5210,
    video: 2913,
    answered: 6120,
    missed: 1450,
    rejected: 553,
    avgDuration: 218,
    totalDuration: 1334520,
    successRate: 75,
  },
  callsByDay: [
    { date: '2026-05-28', audio: 720, video: 410 },
    { date: '2026-05-29', audio: 810, video: 380 },
    { date: '2026-05-30', audio: 690, video: 450 },
    { date: '2026-05-31', audio: 740, video: 390 },
    { date: '2026-06-01', audio: 820, video: 470 },
    { date: '2026-06-02', audio: 760, video: 410 },
    { date: '2026-06-03', audio: 670, video: 403 },
  ],
  stories: {
    total: 2456,
    totalViews: 84210,
    totalLikes: 12890,
    avgViews: 34,
    engagementRate: 15,
    byType: [
      { type: 0, label: 'Texte', count: 980 },
      { type: 1, label: 'Image', count: 1120 },
      { type: 2, label: 'Vidéo', count: 356 },
    ],
  },
  meetings: {
    total: 312,
    avgDuration: 1840,
    accepted: 1120,
    declined: 240,
    invited: 410,
    attendanceRate: 63,
    noShowRate: 37,
  },
  users: {
    byRole: [
      { role: 0, label: 'Utilisateur', count: 12290 },
      { role: 1, label: 'Admin', count: 18 },
      { role: 2, label: 'Super-admin', count: 3 },
    ],
    newUsers: 406,
    bannedUsers: 12,
    totalUsers: 12450,
  },
  devices: [
    { os: 'Android', count: 7820 },
    { os: 'iOS', count: 4210 },
    { os: 'Inconnu', count: 420 },
  ],
  conversations: {
    total: 18420,
    groups: 2310,
    oneToOne: 16110,
    avgGroupSize: 6.4,
  },
  heatmap: mockHeatmap,
  comparison: {
    messages: 41200,
    calls: 7640,
    statuses: 2210,
    registrations: 372,
  },
  period: { from: '2026-05-28', to: '2026-06-04' },
  previousPeriod: { from: '2026-05-21', to: '2026-05-28' },
};
