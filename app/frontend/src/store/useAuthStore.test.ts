import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/auth', () => ({
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'u2',
    nombre: 'Juan Pérez',
    email: 'juan@x.com',
    rol: 'ASESOR',
  }),
}));

import { queryClient } from '../queryClient';
import { useAuthStore } from './useAuthStore';

// A previous user's cached data (e.g. the director's KPIs)
const cacheDelDirector = () =>
  queryClient.setQueryData(['kpis', 'Todos', 44], { visitas: 99 });

describe('useAuthStore: no data leaks between users in the same browser', () => {
  beforeEach(() => queryClient.clear());

  it('logout empties the query cache', async () => {
    cacheDelDirector();
    await useAuthStore.getState().logout();
    expect(queryClient.getQueryData(['kpis', 'Todos', 44])).toBeUndefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('an expired session (401) empties the query cache', () => {
    cacheDelDirector();
    useAuthStore.getState().clearSession();
    expect(queryClient.getQueryData(['kpis', 'Todos', 44])).toBeUndefined();
  });

  it('logging in as another user starts with an empty cache', async () => {
    cacheDelDirector();
    const ok = await useAuthStore
      .getState()
      .login({ email: 'juan@x.com', password: 'secret-123' });
    expect(ok).toBe(true);
    expect(queryClient.getQueryData(['kpis', 'Todos', 44])).toBeUndefined();
    expect(useAuthStore.getState().user?.nombre).toBe('Juan Pérez');
  });
});
