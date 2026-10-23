export interface ClientContactProps {
  id?: number;
  customerId?: number;
  name: string;
  position?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
}

export class ClientContact {
  private readonly _id?: number;
  private readonly _customerId?: number;
  private readonly _name: string;
  private readonly _position: string | null;
  private readonly _phone: string | null;
  private readonly _mobilePhone: string | null;
  private readonly _email: string | null;
  private readonly _isPrimary: boolean;

  constructor(props: ClientContactProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('El nombre del contacto es obligatorio');
    }
    this._id = props.id;
    this._customerId = props.customerId;
    this._name = props.name.trim();
    this._position = props.position ?? null;
    this._phone = props.phone ?? null;
    this._mobilePhone = props.mobilePhone ?? null;
    this._email = props.email ?? null;
    this._isPrimary = props.isPrimary ?? false;
  }

  get id(): number | undefined {
    return this._id;
  }
  get customerId(): number | undefined {
    return this._customerId;
  }
  get name(): string {
    return this._name;
  }
  get position(): string | null {
    return this._position;
  }
  get phone(): string | null {
    return this._phone;
  }
  get mobilePhone(): string | null {
    return this._mobilePhone;
  }
  get email(): string | null {
    return this._email;
  }
  get isPrimary(): boolean {
    return this._isPrimary;
  }
}
