import { InvalidOperationException } from '../../../../domain-contracts/index.js';

export interface RouteStopProps {
  id?: number;
  routeId?: number;
  customerId: number;
  visitOrder: number;
  suggestedTime?: string | null;
}

export class RouteStop {
  private static readonly TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

  private constructor(
    public readonly customerId: number,
    public readonly visitOrder: number,
    public readonly suggestedTime: string | null,
    public readonly id?: number,
    public readonly routeId?: number,
  ) {}

  static create(props: RouteStopProps): RouteStop {
    if (!props.customerId || props.customerId <= 0) {
      throw new InvalidOperationException('El ID del cliente debe ser válido.');
    }

    if (props.visitOrder <= 0) {
      throw new InvalidOperationException(
        'El orden de visita debe ser un número positivo.',
      );
    }

    if (
      props.suggestedTime &&
      !RouteStop.TIME_REGEX.test(props.suggestedTime)
    ) {
      throw new InvalidOperationException(
        'Formato de hora sugerida inválido. Debe ser HH:MM.',
      );
    }

    return new RouteStop(
      props.customerId,
      props.visitOrder,
      props.suggestedTime ?? null,
      props.id,
      props.routeId,
    );
  }

  toRecord(): {
    customerId: number;
    visitOrder: number;
    suggestedTime: string | null;
  } {
    return {
      customerId: this.customerId,
      visitOrder: this.visitOrder,
      suggestedTime: this.suggestedTime,
    };
  }
}
