import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';

// Token de inyección de la instancia de Better Auth.
export const AUTH = Symbol('AUTH');

/**
 * Duración de la sesión cuando el usuario marca "Recordarme".
 * Es el `session.expiresIn` de Better Auth: la cookie de sesión se guarda con
 * `Max-Age` de 30 días y la fila de `session` expira en 30 días.
 */
export const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 días

/**
 * Duración de la sesión cuando el usuario NO marca "Recordarme".
 * Better Auth la aplica de forma nativa cuando el cliente envía
 * `rememberMe: false` en `POST /api/auth/sign-in/email`: la cookie se envía
 * como cookie de sesión (se borra al cerrar el navegador) y la fila de
 * `session` expira en 1 día. Es el valor que usa Better Auth internamente
 * (`dontRememberMe`), por eso se documenta aquí y se verifica en las pruebas.
 */
export const SESSION_WITHOUT_REMEMBER_SECONDS = 60 * 60 * 24; // 1 día

/**
 * Cada cuánto se renueva la sesión en el servidor cuando el usuario la usa
 * (evita que la sesión caduque a mitad de uso). 1 día.
 */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export function createAuth(pool: Pool, env: NodeJS.ProcessEnv = process.env) {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET es obligatorio y debe tener al menos 32 caracteres',
    );
  }

  // Better Auth cuelga sus rutas de <basePath> (por defecto /api/auth) y esa
  // ruta es la que monta la aplicación en Express (ver app.setup.ts). Si el
  // baseURL trajera un path, las rutas de auth quedarían en otro sitio.
  const baseURL = env.BETTER_AUTH_URL ?? 'http://localhost:3001';
  const { pathname } = new URL(baseURL);
  if (pathname !== '/' && pathname !== '') {
    throw new Error(
      'BETTER_AUTH_URL debe ser el origen del backend (sin ruta), por ejemplo https://api.comercial360.com',
    );
  }

  return betterAuth({
    database: pool,
    secret,
    // Better Auth cuelga sus rutas de /api/auth (basePath por defecto)
    baseURL,
    // Únicos orígenes del navegador autorizados a llamar a los endpoints de auth
    trustedOrigins: allowedOrigins(env),
    emailAndPassword: {
      enabled: true,
      // No hay registro público: los usuarios los crea el seed/administración.
      disableSignUp: true,
    },
    session: {
      // Sesión recordada: 30 días de cookie y de fila en `session`.
      expiresIn: REMEMBER_ME_SESSION_SECONDS,
      // Se renueva como máximo una vez al día mientras el usuario la usa.
      updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    user: {
      additionalFields: {
        // input:false => el cliente nunca puede enviar ni cambiar su rol
        role: {
          type: 'string',
          required: true,
          defaultValue: 'ASESOR',
          input: false,
        },
      },
    },
    advanced: {
      // Cookie Secure solo en producción (en desarrollo se usa http://localhost)
      useSecureCookies: env.NODE_ENV === 'production',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
      // Verifica siempre el origen de las peticiones con cookies (Better Auth lo
      // omitiría por defecto si NODE_ENV fuera 'test').
      disableOriginCheck: false,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

/** Orígenes del frontend permitidos (CORS y trustedOrigins). */
export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const frontendOrigins = (env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const backendOrigin = new URL(env.BETTER_AUTH_URL ?? 'http://localhost:3001')
    .origin;

  return [...new Set([...frontendOrigins, backendOrigin])];
}
