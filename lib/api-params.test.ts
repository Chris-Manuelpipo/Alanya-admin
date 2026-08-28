import { describe, it, expect } from 'vitest';
import { buildUsersApiParams, USER_SORT_COLUMNS, type UserSortColumn, type OrderDir } from './api-params';

describe('buildUsersApiParams', () => {
  it('garde idPays en camelCase (colonne MySQL)', () => {
    const out = buildUsersApiParams({ idPays: 7 });
    expect(out.idPays).toBe(7);
    expect(out).not.toHaveProperty('id_pays');
  });

  it('renomme accountType en account_type (snake_case)', () => {
    const out = buildUsersApiParams({ accountType: '1' });
    expect(out.account_type).toBe('1');
    expect(out).not.toHaveProperty('accountType');
  });

  it('supprime les valeurs vides', () => {
    const out = buildUsersApiParams({ search: '', status: '', idPays: '', accountType: '' });
    expect(out).not.toHaveProperty('search');
    expect(out).not.toHaveProperty('status');
    expect(out).not.toHaveProperty('idPays');
    expect(out).not.toHaveProperty('account_type');
  });

  it('applique les défauts page/limit', () => {
    const out = buildUsersApiParams({});
    expect(out.page).toBe(1);
    expect(out.limit).toBe(20);
  });

  it('rejette une colonne de tri inconnue vers created_at (défaut serveur)', () => {
    const out = buildUsersApiParams({ sort: 'bogus' as UserSortColumn });
    expect(out).not.toHaveProperty('sort');
  });

  it('n’envoie sort que s’il diffère du défaut created_at', () => {
    expect(buildUsersApiParams({ sort: 'created_at' })).not.toHaveProperty('sort');
    expect(buildUsersApiParams({ sort: 'nom' }).sort).toBe('nom');
    expect(buildUsersApiParams({ sort: 'last_seen' }).sort).toBe('last_seen');
  });

  it('n’envoie order que pour "asc" (desc = défaut serveur)', () => {
    expect(buildUsersApiParams({ order: 'desc' })).not.toHaveProperty('order');
    expect(buildUsersApiParams({ order: 'asc' }).order).toBe('asc');
    expect(buildUsersApiParams({ order: 'bogus' as OrderDir })).not.toHaveProperty('order');
  });

  it('garde from/to texte', () => {
    const out = buildUsersApiParams({ from: '2026-01-01', to: '2026-02-01' });
    expect(out.from).toBe('2026-01-01');
    expect(out.to).toBe('2026-02-01');
  });

  it('UPDATE_SENTINEL: la whitelist de tri couvre les trois colonnes autorisées', () => {
    expect(USER_SORT_COLUMNS).toEqual(['created_at', 'nom', 'last_seen']);
  });
});
