import { create } from 'zustand';
import axios from 'axios';
import { IUser, ILoginCredentials } from '../types/auth';
import { setUnauthorizedHandler } from '../api/client';
import { getCurrentUser, signIn, signOut } from '../api/auth';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** true mientras se consulta al backend si ya hay una sesión abierta */
  isCheckingSession: boolean;
  error: string | null;
  login: (credentials: ILoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
  setUser: (user: IUser) => void;
}

const loginErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }
  if (error.response.status === 401) {
    return 'Correo o contraseña incorrectos.';
  }
  // GET /me responde 403 si un ASESOR no tiene registro de asesor vinculado
  if (error.response.status === 403 && error.config?.url === '/me') {
    return 'Tu usuario no tiene un asesor asociado. Contacta al administrador.';
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingSession: true,
  error: null,

  login: async (credentials: ILoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      await signIn(credentials);
    } catch (error) {
      set({ isLoading: false, error: loginErrorMessage(error) });
      return false;
    }

    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      // La cookie ya se creó: se cierra para no dejar una sesión a medias
      await signOut().catch(() => undefined);
      set({ isLoading: false, error: loginErrorMessage(error) });
      return false;
    }
  },

  logout: async () => {
    await signOut().catch(() => undefined);
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  checkSession: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isCheckingSession: false });
    }
  },

  clearSession: () => set({ user: null, isAuthenticated: false }),

  setUser: (user: IUser) => set({ user }),
}));

setUnauthorizedHandler(() => useAuthStore.getState().clearSession());
