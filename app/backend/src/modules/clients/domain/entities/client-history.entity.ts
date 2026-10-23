export interface ClientHistoryProps {
  id?: number;
  customerId: number;
  date?: Date;
  action: string;
  user: string;
  description?: string | null;
}

export class ClientHistory {
  private readonly _id?: number;
  private readonly _customerId: number;
  private readonly _date: Date;
  private readonly _action: string;
  private readonly _user: string;
  private readonly _description: string | null;

  constructor(props: ClientHistoryProps) {
    if (!props.action || props.action.trim().length === 0) {
      throw new Error('La acción del historial es obligatoria');
    }
    if (!props.user || props.user.trim().length === 0) {
      throw new Error('El usuario del historial es obligatorio');
    }
    this._id = props.id;
    this._customerId = props.customerId;
    this._date = props.date ?? new Date();
    this._action = props.action.trim();
    this._user = props.user.trim();
    this._description = props.description ?? null;
  }

  get id(): number | undefined {
    return this._id;
  }
  get customerId(): number {
    return this._customerId;
  }
  get date(): Date {
    return this._date;
  }
  get action(): string {
    return this._action;
  }
  get user(): string {
    return this._user;
  }
  get description(): string | null {
    return this._description;
  }
}
