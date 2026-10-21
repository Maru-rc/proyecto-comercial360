import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';

// Token de inyección de la instancia de Better Auth.
export const AUTH = Symbol('AUTH');

// Duración de la sesión cuando el usuario marca "Recordarme".
// Sin "Recordarme", Better Auth usa una cookie de sesión (se borra al cerrar el
// navegador) y la sesión en el servidor dura 1 día.
export const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 días

export function createAuth(pool: Pool, env: NodeJS.ProcessEnv = process.env) {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET es obligatorio y debe tener al menos 32 caracteres',
    );
  }

  return betterAuth({
    database: pool,
    secret,
    // Better Auth cuelga sus rutas de /api/auth (basePath por defecto)
    baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:3001',
    // Únicos orígenes del navegador autorizados a llamar a los endpoints de auth
    trustedOrigins: allowedOrigins(env),
    emailAndPassword: {
      enabled: true,
      // No hay registro público: los usuarios los crea el seed/administración.
      disableSignUp: true,
    },
    session: {
      expiresIn: REMEMBER_ME_SESSION_SECONDS,
      updateAge: 60 * 60 * 24, // renueva la sesión como máximo una vez al día
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
