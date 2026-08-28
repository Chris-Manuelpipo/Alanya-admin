import { describe, it, expect } from 'vitest';
import { mockUsersResponse } from './users';
import { buildUsersApiParams } from '@/lib/api-params';

describe('mockUsersResponse', () => {
  it('filtre par pays (idPays)', () => {
    const out = mockUsersResponse({ idPays: '2' });
    expect(out.total).toBeGreaterThan(0);
    expect(out.items.every((u) => String(u.idPays) === '2')).toBe(true);
  });

  it('filtre par statut banni', () => {
    const out = mockUsersResponse({ status: 'banned' });
    expect(out.items.every((u) => u.exclus)).toBe(true);
  });

  it('filtre par type de compte', () => {
    const out = mockUsersResponse({ accountType: '0' });
    expect(out.items.every((u) => String(u.accountType ?? 0) === '0')).toBe(true);
  });

  it('pagine correctement', () => {
    const all = mockUsersResponse({}).items;
    const page1 = mockUsersResponse({ page: 1, limit: 3 }).items;
    const page2 = mockUsersResponse({ page: 2, limit: 3 }).items;
    expect(page1).toHaveLength(3);
    expect(page2).toHaveLength(3);
    expect(page1[0].alanyaID).not.toBe(page2[0].alanyaID);
    expect(page1.concat(page2).length).toBeLessThanOrEqual(all.length);
  });

  it('traduit accountType → account_type comme le backend (contrat partagé)', () => {
    expect(buildUsersApiParams({ accountType: '1' }).account_type).toBe('1');
  });
});
