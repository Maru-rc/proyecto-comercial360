import { create } from 'zustand';
import { IUser, ILoginCredentials } from '../types/auth';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: ILoginCredentials) => Promise<boolean>;
  loginMicrosoft: () => Promise<boolean>;
  logout: () => void;
  setUser: (user: IUser) => void;
  toggleRole: () => void;
}

const DEFAULT_USER: IUser = {
  id: 'usr-001',
  nombre: 'Juan Pérez',
  email: 'juan.perez@comercial360.com',
  rol: 'ASESOR',
  cargo: 'Asesor Comercial',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  asesorId: 'ase-001',
  territorio: 'NORTE',
};

const DIRECTOR_USER: IUser = {
  id: 'usr-002',
  nombre: 'Richard Lopez',
  email: 'richard.lopez@comercial360.com',
  rol: 'DIRECTOR_REGIONAL',
  cargo: 'Director Regional',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  territorio: 'Atlántico',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  token: 'mock-jwt-token-comercial360',
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (credentials: ILoginCredentials) => {
    set({ isLoading: true, error: null });
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (credentials.email.includes('richard')) {
      set({
        user: DIRECTOR_USER,
        token: 'mock-jwt-director',
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    set({
      user: DEFAULT_USER,
      token: 'mock-jwt-asesor',
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },

  loginMicrosoft: async () => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({
      user: DEFAULT_USER,
      token: 'mock-jwt-microsoft-365',
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  setUser: (user: IUser) => set({ user }),

  toggleRole: () => {
    const current = get().user;
    if (current?.rol === 'DIRECTOR_REGIONAL') {
      set({ user: DEFAULT_USER });
    } else {
      set({ user: DIRECTOR_USER });
    }
  },
}));
