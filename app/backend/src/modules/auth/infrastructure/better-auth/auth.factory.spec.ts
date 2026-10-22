import type { Pool } from 'pg';
import {
  allowedOrigins,
  createAuth,
  REMEMBER_ME_SESSION_SECONDS,
  SESSION_WITHOUT_REMEMBER_SECONDS,
} from './auth.factory.js';

// La instancia de Better Auth no abre conexiones al crearse (el pool solo se
// usa cuando se consulta), así que aquí no hace falta una base de datos.
const pool = {
  connect: async () => ({ release: () => {} }),
  query: async () => ({ rows: [] }),
  end: async () => {},
} as unknown as Pool;

const ENV = {
  BETTER_AUTH_SECRET: 'a'.repeat(48),
  BETTER_AUTH_URL: 'http://localhost:3001',
  FRONTEND_URL: 'http://localhost:5173',
};

describe('createAuth (configuración de Better Auth)', () => {
  it('exige un secreto de al menos 32 caracteres', () => {
    expect(() =>
      createAuth(pool, { ...ENV, BETTER_AUTH_SECRET: undefined }),
    ).toThrow(/BETTER_AUTH_SECRET/);
    expect(() =>
      createAuth(pool, { ...ENV, BETTER_AUTH_SECRET: 'corta' }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('exige que BETTER_AUTH_URL sea un origen sin ruta', () => {
    expect(() =>
      createAuth(pool, {
        ...ENV,
        BETTER_AUTH_URL: 'http://localhost:3001/api',
      }),
    ).toThrow(/sin ruta/);
  });

  it('deja el registro público deshabilitado', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
    expect(auth.options.emailAndPassword?.disableSignUp).toBe(true);
  });

  it('usa 30 días de sesión para la sesión recordada', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.session?.expiresIn).toBe(REMEMBER_ME_SESSION_SECONDS);
    expect(REMEMBER_ME_SESSION_SECONDS).toBe(60 * 60 * 24 * 30);
  });

  it('deja el rol fuera de la entrada del cliente (input: false)', () => {
    const auth = createAuth(pool, ENV);
    const role = auth.options.user?.additionalFields?.role as
      { input?: boolean; defaultValue?: string } | undefined;
    expect(role?.input).toBe(false);
    expect(role?.defaultValue).toBe('ASESOR');
  });

  it('expone las cookies de sesión como httpOnly', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.advanced?.defaultCookieAttributes).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
    });
  });
});

describe('allowedOrigins', () => {
  it('incluye el origen del frontend y el del backend, sin repetir', () => {
    const origins = allowedOrigins({
      FRONTEND_URL: 'http://localhost:5173,http://localhost:3001',
      BETTER_AUTH_URL: 'http://localhost:3001',
    });
    expect(origins).toEqual(['http://localhost:5173', 'http://localhost:3001']);
  });

  it('acepta varios frontends separados por coma', () => {
    const origins = allowedOrigins({
      FRONTEND_URL: 'http://localhost:5173, https://app.comercial360.com',
      BETTER_AUTH_URL: 'https://api.comercial360.com',
    });
    expect(origins).toContain('http://localhost:5173');
    expect(origins).toContain('https://app.comercial360.com');
    expect(origins).toContain('https://api.comercial360.com');
  });

  it('usa los valores por defecto si no hay variables', () => {
    expect(allowedOrigins({})).toEqual([
      'http://localhost:5173',
      'http://localhost:3001',
    ]);
  });
});

describe('constantes de sesión', () => {
  it('la sesión sin "Recordarme" dura 1 día', () => {
    expect(SESSION_WITHOUT_REMEMBER_SECONDS).toBe(60 * 60 * 24);
  });
});
