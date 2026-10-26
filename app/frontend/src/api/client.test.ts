import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosAdapter } from 'axios';
import { apiClient, apiErrorMessage, setUnauthorizedHandler } from './client';

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

describe('apiErrorMessage', () => {
  const FALLBACK = 'No se pudo guardar';
  const failWith = (status: number, data: unknown) =>
    apiClient
      .post('/rutas', {}, { adapter: respondWith(status, data) })
      .catch((error: unknown) => error);

  it('joins the NestJS validation messages', async () => {
    const error = await failWith(400, {
      message: ['La hora de inicio debe tener formato HH:mm (ej. 08:00)', 'b'],
      statusCode: 400,
    });
    expect(apiErrorMessage(error, FALLBACK)).toBe(
      'La hora de inicio debe tener formato HH:mm (ej. 08:00). b',
    );
  });

  it('uses a single message as it comes', async () => {
    const error = await failWith(409, { message: 'La ruta ya existe' });
    expect(apiErrorMessage(error, FALLBACK)).toBe('La ruta ya existe');
  });

  it('falls back when the response has no message', async () => {
    const error = await failWith(500, {});
    expect(apiErrorMessage(error, FALLBACK)).toBe(FALLBACK);
  });

  it('keeps the message of an app error, e.g. an invalid id', () => {
    expect(apiErrorMessage(new Error('Cliente inválido: x'), FALLBACK)).toBe(
      'Cliente inválido: x',
    );
  });
});
