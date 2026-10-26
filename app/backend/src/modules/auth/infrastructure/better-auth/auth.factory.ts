import { Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';
import { USER_ROLES } from '../../domain/role.js';
import type { PasswordResetRequest } from '../../application/use-cases/send-password-reset-email.use-case.js';

export const AUTH = Symbol('AUTH');

export const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30;

export const SESSION_WITHOUT_REMEMBER_SECONDS = 60 * 60 * 24;

export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export const RESET_PASSWORD_TOKEN_SECONDS = 60 * 60;

/**
 * Proxies between the client and the backend (host nginx, frontend container,
 * Docker network). Without them a two-hop X-Forwarded-For is not resolved and
 * every client shares one rate-limit bucket on sign-in.
 */
export const TRUSTED_PROXY_CIDRS = [
  '127.0.0.0/8',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '::1/128',
];

export interface AuthHooks {
  /** HU-22: delivers the recovery link (email adapter behind a port). */
  readonly sendPasswordReset?: (request: PasswordResetRequest) => Promise<void>;
}

const logger = new Logger('BetterAuth');

export function createAuth(
  pool: Pool,
  env: NodeJS.ProcessEnv = process.env,
  hooks: AuthHooks = {},
) {
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
      resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_SECONDS,
      // A reset closes every open session of the account
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        if (!hooks.sendPasswordReset) return;
        // Not awaited: the response time must not reveal whether the email exists
        void hooks
          .sendPasswordReset({ email: user.email, name: user.name, url })
          .catch((error: unknown) =>
            logger.error(
              `Password reset email failed: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
      },
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
          defaultValue: USER_ROLES.ADVISOR,
          input: false,
        },
      },
    },
    advanced: {
      useSecureCookies: env.NODE_ENV === 'production',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
      disableOriginCheck: false,
      ipAddress: { trustedProxies: TRUSTED_PROXY_CIDRS },
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
