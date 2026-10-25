import { apiClient } from './client';
import { IUser, ILoginCredentials } from '../types/auth';

/** Response from GET /api/me (MeResponseDto from backend). */
interface IMeResponse {
  id: string;
  name: string;
  email: string;
  role: 'ADVISOR' | 'DIRECTOR';
  advisor: { idAdvisor: number; phone: string | null; status: string } | null;
}

const toUser = (me: IMeResponse): IUser => {
  const isDirector = me.role === 'DIRECTOR';
  return {
    id: me.id,
    nombre: me.name,
    email: me.email,
    rol: isDirector ? 'DIRECTOR_REGIONAL' : 'ASESOR',
    cargo: isDirector ? 'Director Regional' : 'Asesor Comercial',
    asesorId: me.advisor ? String(me.advisor.idAdvisor) : undefined,
  };
};

/** Inicia sesión; Better Auth responde con la cookie de sesión. */
export const signIn = async ({
  email,
  password,
  rememberMe,
}: ILoginCredentials): Promise<void> => {
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
