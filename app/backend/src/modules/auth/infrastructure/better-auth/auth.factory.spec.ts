import type { Pool } from 'pg';
import { USER_ROLES } from '../../domain/role.js';
import {
  allowedOrigins,
  createAuth,
  REMEMBER_ME_SESSION_SECONDS,
  SESSION_WITHOUT_REMEMBER_SECONDS,
  TRUSTED_PROXY_CIDRS,
} from './auth.factory.js';

// The Better Auth instance does not open connections upon creation
// (the pool is only used on queries), so no real database is needed here.
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

describe('createAuth (Better Auth configuration)', () => {
  it('requires a secret of at least 32 characters', () => {
    expect(() =>
      createAuth(pool, { ...ENV, BETTER_AUTH_SECRET: undefined }),
    ).toThrow(/BETTER_AUTH_SECRET/);
    expect(() =>
      createAuth(pool, { ...ENV, BETTER_AUTH_SECRET: 'short' }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('requires BETTER_AUTH_URL to be an origin without path', () => {
    expect(() =>
      createAuth(pool, {
        ...ENV,
        BETTER_AUTH_URL: 'http://localhost:3001/api',
      }),
    ).toThrow(/no path/);
  });

  it('leaves public self-registration disabled', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
    expect(auth.options.emailAndPassword?.disableSignUp).toBe(true);
  });

  it('uses 30 days of session duration for remembered sessions', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.session?.expiresIn).toBe(REMEMBER_ME_SESSION_SECONDS);
    expect(REMEMBER_ME_SESSION_SECONDS).toBe(60 * 60 * 24 * 30);
  });

  it('excludes role from client input (input: false)', () => {
    const auth = createAuth(pool, ENV);
    const role = auth.options.user?.additionalFields?.role as
      { input?: boolean; defaultValue?: string } | undefined;
    expect(role?.input).toBe(false);
    expect(role?.defaultValue).toBe(USER_ROLES.ADVISOR);
  });

  it('exposes session cookies as httpOnly and lax', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.advanced?.defaultCookieAttributes).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
    });
  });

  it('trusts the private-network proxies to resolve the client IP', () => {
    const auth = createAuth(pool, ENV);
    expect(auth.options.advanced?.ipAddress?.trustedProxies).toEqual(
      TRUSTED_PROXY_CIDRS,
    );
  });
});

describe('allowedOrigins', () => {
  it('includes frontend and backend origins without duplicates', () => {
    const origins = allowedOrigins({
      FRONTEND_URL: 'http://localhost:5173,http://localhost:3001',
      BETTER_AUTH_URL: 'http://localhost:3001',
    });
    expect(origins).toEqual(['http://localhost:5173', 'http://localhost:3001']);
  });

  it('accepts multiple frontend URLs separated by commas', () => {
    const origins = allowedOrigins({
      FRONTEND_URL: 'http://localhost:5173, https://app.comercial360.com',
      BETTER_AUTH_URL: 'https://api.comercial360.com',
    });
    expect(origins).toContain('http://localhost:5173');
    expect(origins).toContain('https://app.comercial360.com');
    expect(origins).toContain('https://api.comercial360.com');
  });

  it('uses default values if environment variables are not provided', () => {
    expect(allowedOrigins({})).toEqual([
      'http://localhost:5173',
      'http://localhost:3001',
    ]);
  });
});

describe('Session constants', () => {
  it('session without rememberMe lasts 1 day', () => {
    expect(SESSION_WITHOUT_REMEMBER_SECONDS).toBe(60 * 60 * 24);
  });
});
