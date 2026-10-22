import { apiClient } from './client';
import { IUser, ILoginCredentials } from '../types/auth';

/** Respuesta de GET /api/me (MeResponseDto del backend). */
interface IMeResponse {
  id: string;
  nombre: string;
  email: string;
  rol: 'ASESOR' | 'DIRECTOR';
  asesor: { id_asesor: number; telefono: string | null; estado: string } | null;
}

// El backend llama DIRECTOR al rol que el frontend muestra como DIRECTOR_REGIONAL
const toUser = (me: IMeResponse): IUser => {
  const isDirector = me.rol === 'DIRECTOR';
  return {
    id: me.id,
    nombre: me.nombre,
    email: me.email,
    rol: isDirector ? 'DIRECTOR_REGIONAL' : 'ASESOR',
    cargo: isDirector ? 'Director Regional' : 'Asesor Comercial',
    asesorId: me.asesor ? String(me.asesor.id_asesor) : undefined,
  };
};

/** Inicia sesión; Better Auth responde con la cookie de sesión. */
export const signIn = async ({ email, password, rememberMe }: ILoginCredentials): Promise<void> => {
  await apiClient.post('/auth/sign-in/email', { email, password, rememberMe });
};

/** Usuario de la sesión actual. Responde 401 si no hay sesión. */
export const getCurrentUser = async (): Promise<IUser> => {
  const res = await apiClient.get<IMeResponse>('/me');
  return toUser(res.data);
};

export const signOut = async (): Promise<void> => {
  await apiClient.post('/auth/sign-out', {});
};
