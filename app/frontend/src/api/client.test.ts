import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosAdapter } from 'axios';
import { apiClient, setUnauthorizedHandler } from './client';

const respondWith =
  (status: number, data: unknown): AxiosAdapter =>
  async (config) => {
    const response = { data, status, statusText: '', headers: {}, config };
    if (status >= 400) {
      throw Object.assign(new Error(`HTTP ${status}`), {
        config,
        response,
        isAxiosError: true,
      });
    }
    return response;
  };

describe('apiClient', () => {
  beforeEach(() => setUnauthorizedHandler(() => {}));

  it('unwraps the backend envelope { data, meta }', async () => {
    const res = await apiClient.get('/x', {
      adapter: respondWith(200, { data: [1, 2], meta: { timestamp: 't' } }),
    });
    expect(res.data).toEqual([1, 2]);
  });

  it('leaves responses without the envelope (e.g. a Blob) untouched', async () => {
    const blob = new Blob(['a,b']);
    const res = await apiClient.get('/file.csv', {
      adapter: respondWith(200, blob),
    });
    expect(res.data).toBe(blob);
  });

  it('a 401 outside /auth ends the session', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    await expect(
      apiClient.get('/clientes', { adapter: respondWith(401, {}) }),
    ).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('a 401 from /auth (wrong password) does not', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    await expect(
      apiClient.post(
        '/auth/sign-in/email',
        {},
        { adapter: respondWith(401, {}) },
      ),
    ).rejects.toThrow();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
