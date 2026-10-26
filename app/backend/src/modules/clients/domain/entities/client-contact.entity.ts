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
  public readonly id?: number;
  public readonly customerId?: number;
  public readonly name: string;
  public readonly position: string | null;
  public readonly phone: string | null;
  public readonly mobilePhone: string | null;
  public readonly email: string | null;
  public readonly isPrimary: boolean;

  constructor(props: ClientContactProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('El nombre del contacto es obligatorio');
    }
    this.id = props.id;
    this.customerId = props.customerId;
    this.name = props.name.trim();
    this.position = props.position ?? null;
    this.phone = props.phone ?? null;
    this.mobilePhone = props.mobilePhone ?? null;
    this.email = props.email ?? null;
    this.isPrimary = props.isPrimary ?? false;
  }

  static create(props: {
    name?: string | null;
    position?: string | null;
    phone?: string | null;
    mobilePhone?: string | null;
    email?: string | null;
    isPrimary?: boolean;
    customerId?: number;
  }): ClientContact {
    return new ClientContact({
      name: props.name?.trim() || 'Contacto Principal',
      position: props.position?.trim() ?? null,
      phone: props.phone?.trim() ?? null,
      mobilePhone: props.mobilePhone?.trim() ?? null,
      email: props.email?.trim() ?? null,
      isPrimary: props.isPrimary ?? true,
      customerId: props.customerId,
    });
  }
}
