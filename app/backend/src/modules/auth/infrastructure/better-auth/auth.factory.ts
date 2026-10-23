import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';
import { USER_ROLES } from '../../domain/role.js';

// Injection token for the Better Auth instance.
export const AUTH = Symbol('AUTH');

/**
 * Session duration when the user checks "Remember me".
 * Better Auth sets `Max-Age` on the cookie and the `session` row expires
 * after 30 days.
 */
export const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Session duration when the user does NOT check "Remember me".
 * Better Auth applies this natively when the client sends `rememberMe: false`
 * in `POST /api/auth/sign-in/email`: the cookie is sent as a session cookie
 * (cleared when the browser closes) and the `session` row expires in 1 day.
 */
export const SESSION_WITHOUT_REMEMBER_SECONDS = 60 * 60 * 24; // 1 day

/**
 * How often the session is renewed on the server while the user is active
 * (prevents the session from expiring mid-use). 1 day.
 */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export function createAuth(pool: Pool, env: NodeJS.ProcessEnv = process.env) {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET is required and must be at least 32 characters long',
    );
  }

  // Better Auth mounts its routes under <baseURL>/api/auth.
  // If BETTER_AUTH_URL included a path the auth routes would end up elsewhere.
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
    // Only these browser origins are allowed to call the auth endpoints
    trustedOrigins: allowedOrigins(env),
    emailAndPassword: {
      enabled: true,
      // No public registration: users are created by the seed/admin only.
      disableSignUp: true,
    },
    session: {
      // Remembered session: 30-day cookie and 30-day row in `session`.
      expiresIn: REMEMBER_ME_SESSION_SECONDS,
      // Renewed at most once per day while the user is active.
      updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    user: {
      additionalFields: {
        // input:false — the client can never send or change their own role
        role: {
          type: 'string',
          required: true,
          defaultValue: USER_ROLES.ADVISOR,
          input: false,
        },
      },
    },
    advanced: {
      // Secure cookies only in production (http://localhost is fine in dev)
      useSecureCookies: env.NODE_ENV === 'production',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
      // Always verify the request origin — never skip this check.
      disableOriginCheck: false,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

/** Frontend origins allowed for CORS and trustedOrigins. */
export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const frontendOrigins = (env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const backendOrigin = new URL(env.BETTER_AUTH_URL ?? 'http://localhost:3001')
    .origin;

  return [...new Set([...frontendOrigins, backendOrigin])];
}
