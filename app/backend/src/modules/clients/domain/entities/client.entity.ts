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
  private readonly _id?: number;
  private readonly _nit: Nit;
  private readonly _legalName: string;
  private readonly _commercialName: string | null;
  private readonly _address: string | null;
  private readonly _department: string | null;
  private readonly _municipality: string | null;
  private readonly _neighborhood: string | null;
  private readonly _phone: string | null;
  private readonly _email: string | null;
  private readonly _coordinates: Coordinates;
  private readonly _visitFrequencyDays: number | null;
  private readonly _isActive: boolean;
  private readonly _zoneId: number | null;
  private readonly _customerTypeId: number | null;
  private readonly _potentialId: number | null;
  private readonly _customerStatusId: number | null;
  private readonly _createdAt: Date;

  constructor(props: ClientProps) {
    this._id = props.id;
    this._nit = props.nit;
    this._legalName = props.legalName;
    this._commercialName = props.commercialName ?? null;
    this._address = props.address ?? null;
    this._department = props.department ?? null;
    this._municipality = props.municipality ?? null;
    this._neighborhood = props.neighborhood ?? null;
    this._phone = props.phone ?? null;
    this._email = props.email ?? null;
    this._coordinates = props.coordinates;
    this._visitFrequencyDays = props.visitFrequencyDays ?? null;
    this._isActive = props.isActive ?? true;
    this._zoneId = props.zoneId ?? null;
    this._customerTypeId = props.customerTypeId ?? null;
    this._potentialId = props.potentialId ?? null;
    this._customerStatusId = props.customerStatusId ?? null;
    this._createdAt = props.createdAt ?? new Date();
  }

  get id(): number | undefined {
    return this._id;
  }
  get nit(): Nit {
    return this._nit;
  }
  get legalName(): string {
    return this._legalName;
  }
  get commercialName(): string | null {
    return this._commercialName;
  }
  get address(): string | null {
    return this._address;
  }
  get department(): string | null {
    return this._department;
  }
  get municipality(): string | null {
    return this._municipality;
  }
  get neighborhood(): string | null {
    return this._neighborhood;
  }
  get phone(): string | null {
    return this._phone;
  }
  get email(): string | null {
    return this._email;
  }
  get coordinates(): Coordinates {
    return this._coordinates;
  }
  get visitFrequencyDays(): number | null {
    return this._visitFrequencyDays;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get zoneId(): number | null {
    return this._zoneId;
  }
  get customerTypeId(): number | null {
    return this._customerTypeId;
  }
  get potentialId(): number | null {
    return this._potentialId;
  }
  get customerStatusId(): number | null {
    return this._customerStatusId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
