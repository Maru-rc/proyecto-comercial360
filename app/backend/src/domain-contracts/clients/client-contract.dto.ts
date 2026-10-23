export interface ClientCoordinatesContractDto {
  latitude: number | null;
  longitude: number | null;
}

export interface ClientContactContractDto {
  name: string;
  phone: string;
  email?: string | null;
  position?: string | null;
}

export interface ClientSummaryContractDto {
  id: number;
  nit: string;
  legalName: string;
  commercialName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  potential?: string | null;
  clientStatus?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  primaryContact?: ClientContactContractDto | null;
}

export interface ClientContractDto {
  id: number;
  nit: string;
  legalName: string;
  commercialName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: Date | string;
}
