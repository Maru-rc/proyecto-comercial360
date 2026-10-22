export interface IUser {
  id: string;
  nombre: string;
  email: string;
  rol: 'ASESOR' | 'DIRECTOR_REGIONAL' | 'ADMIN';
  cargo?: string;
  avatarUrl?: string;
  asesorId?: string;
  territorio?: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
