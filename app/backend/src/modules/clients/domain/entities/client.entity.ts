import { Nit } from '../value-objects/nit.vo.js';
import { Coordinates } from '../value-objects/coordinates.vo.js';

export interface ClientProps {
  id?: number;
  nit: Nit;
  legalName: string;
  commercialName?: string | null;
  address?: string | null;
  department?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  phone?: string | null;
  email?: string | null;
  coordinates: Coordinates;
  visitFrequencyDays?: number | null;
  isActive?: boolean;
  zoneId?: number | null;
  customerTypeId?: number | null;
  potentialId?: number | null;
  customerStatusId?: number | null;
  createdAt?: Date;
}

export class Client {
  public readonly id?: number;
  public readonly nit: Nit;
  public readonly legalName: string;
  public readonly commercialName: string | null;
  public readonly address: string | null;
  public readonly department: string | null;
  public readonly municipality: string | null;
  public readonly neighborhood: string | null;
  public readonly phone: string | null;
  public readonly email: string | null;
  public readonly coordinates: Coordinates;
  public readonly visitFrequencyDays: number | null;
  public readonly isActive: boolean;
  public readonly zoneId: number | null;
  public readonly customerTypeId: number | null;
  public readonly potentialId: number | null;
  public readonly customerStatusId: number | null;
  public readonly createdAt: Date;

  constructor(props: ClientProps) {
    this.id = props.id;
    this.nit = props.nit;
    this.legalName = props.legalName;
    this.commercialName = props.commercialName ?? null;
    this.address = props.address ?? null;
    this.department = props.department ?? null;
    this.municipality = props.municipality ?? null;
    this.neighborhood = props.neighborhood ?? null;
    this.phone = props.phone ?? null;
    this.email = props.email ?? null;
    this.coordinates = props.coordinates;
    this.visitFrequencyDays = props.visitFrequencyDays ?? null;
    this.isActive = props.isActive ?? true;
    this.zoneId = props.zoneId ?? null;
    this.customerTypeId = props.customerTypeId ?? null;
    this.potentialId = props.potentialId ?? null;
    this.customerStatusId = props.customerStatusId ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: {
    nit: Nit | string;
    legalName: string;
    commercialName?: string | null;
    address?: string | null;
    department?: string | null;
    municipality?: string | null;
    neighborhood?: string | null;
    phone?: string | null;
    email?: string | null;
    coordinates: Coordinates;
    visitFrequencyDays?: number | null;
    isActive?: boolean;
    zoneId?: number | null;
    customerTypeId?: number | null;
    potentialId?: number | null;
    customerStatusId?: number | null;
  }): Client {
    const nitVO = props.nit instanceof Nit ? props.nit : new Nit(props.nit);
    const legalName = props.legalName.trim();
    const commercialName = props.commercialName?.trim() || legalName;

    return new Client({
      ...props,
      nit: nitVO,
      legalName,
      commercialName,
      address: props.address?.trim() ?? null,
      department: props.department?.trim() ?? null,
      municipality: props.municipality?.trim() ?? null,
      neighborhood: props.neighborhood?.trim() ?? null,
      phone: props.phone?.trim() ?? null,
      email: props.email?.trim() ?? null,
    });
  }
}
