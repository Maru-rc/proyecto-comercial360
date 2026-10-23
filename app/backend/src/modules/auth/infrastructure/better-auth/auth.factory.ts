import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';

export const AUTH = Symbol('AUTH');

export const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30;

export const SESSION_WITHOUT_REMEMBER_SECONDS = 60 * 60 * 24;

export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export function createAuth(pool: Pool, env: NodeJS.ProcessEnv = process.env) {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET is required and must be at least 32 characters long',
    );
  }

  const baseURL = env.BETTER_AUTH_URL ?? 'http://localhost:3001';
  const { pathname } = new URL(baseURL);
  if (pathname !== '/' && pathname !== '') {
    throw new Error(
      'BETTER_AUTH_URL must be the backend origin (no path), e.g. https://api.comercial360.com',
    );
  }

  return betterAuth({
    database: pool,
    secret,
    baseURL,
    trustedOrigins: allowedOrigins(env),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },
    session: {
      expiresIn: REMEMBER_ME_SESSION_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: true,
          defaultValue: 'ASESOR',
          input: false,
        },
      },
    },
    advanced: {
      useSecureCookies: env.NODE_ENV === 'production',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
      disableOriginCheck: false,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const frontendOrigins = (env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const backendOrigin = new URL(env.BETTER_AUTH_URL ?? 'http://localhost:3001')
    .origin;

  return [...new Set([...frontendOrigins, backendOrigin])];
}
