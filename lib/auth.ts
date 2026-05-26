import { api } from './api';

export async function adminLogin(email: string, password: string) {
  const res = await api.post('/admin/auth/login', { email, password });
  const { accessToken, user } = res.data;
  localStorage.setItem('admin_token', accessToken);
  localStorage.setItem('admin_user', JSON.stringify(user));
  return user;
}

export function adminLogout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function getAdminUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('admin_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getAdminToken();
}
