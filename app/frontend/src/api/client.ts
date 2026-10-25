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
