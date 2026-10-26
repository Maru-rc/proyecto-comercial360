import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // La sesión de Better Auth viaja en una cookie httpOnly
  withCredentials: true,
  timeout: 10000,
});

// El store de auth registra aquí qué hacer cuando la sesión deja de ser válida
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

/**
 * Mensaje legible de un error: el de validación de NestJS (string o lista) o
 * el de un Error propio. Sin respuesta del servidor se usa el fallback.
 */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  const message = (error.response?.data as { message?: unknown } | undefined)
    ?.message;
  if (Array.isArray(message) && message.length > 0) return message.join('. ');
  return typeof message === 'string' && message ? message : fallback;
};

apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      'meta' in response.data
    ) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // Un 401 fuera de /auth significa que la sesión expiró o se cerró
    const isAuthRequest = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
