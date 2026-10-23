export interface ClientCoordinatesContractDto {
  readonly latitude: number | null;
  readonly longitude: number | null;
}

export interface ClientContactContractDto {
  readonly name: string;
  readonly phone: string;
  readonly email?: string | null;
  readonly position?: string | null;
}

export interface ClientSummaryContractDto {
  readonly id: number;
  readonly nit: string;
  readonly legalName: string;
  readonly commercialName?: string | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly isActive: boolean;
  readonly potential?: string | null;
  readonly clientStatus?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly primaryContact?: ClientContactContractDto | null;
}

export interface ClientContractDto {
  readonly id: number;
  readonly nit: string;
  readonly legalName: string;
  readonly commercialName?: string | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly isActive: boolean;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly createdAt?: Date | string;
}
