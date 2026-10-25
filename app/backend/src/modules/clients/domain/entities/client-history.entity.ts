export interface ClientHistoryProps {
  id?: number;
  customerId: number;
  date?: Date;
  action: string;
  user: string;
  description?: string | null;
}

export class ClientHistory {
  public readonly id?: number;
  public readonly customerId: number;
  public readonly date: Date;
  public readonly action: string;
  public readonly user: string;
  public readonly description: string | null;

  constructor(props: ClientHistoryProps) {
    if (!props.action || props.action.trim().length === 0) {
      throw new Error('La acción del historial es obligatoria');
    }
    if (!props.user || props.user.trim().length === 0) {
      throw new Error('El usuario del historial es obligatorio');
    }
    this.id = props.id;
    this.customerId = props.customerId;
    this.date = props.date ?? new Date();
    this.action = props.action.trim();
    this.user = props.user.trim();
    this.description = props.description ?? null;
  }

  static create(props: {
    action: string;
    user?: string | null;
    description?: string | null;
    customerId?: number;
  }): ClientHistory {
    return new ClientHistory({
      customerId: props.customerId ?? 0,
      action: props.action,
      user: props.user?.trim() || 'Sistema',
      description: props.description?.trim() ?? null,
    });
  }
}
