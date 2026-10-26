import { InvalidOperationException } from '../../../../domain-contracts/index.js';

export const VALID_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Sabado',
  'Domingo',
] as const;

export const VALID_FREQUENCIES = [
  'Diaria',
  'Semanal',
  'Quincenal',
  'Mensual',
] as const;

export class Route {
  private constructor(
    public readonly name: string,
    public readonly zoneId: number,
    public readonly executionDay: string,
    public readonly frequency: string,
    public readonly startTime: string | null,
    public readonly endTime: string | null,
    public readonly description: string | null,
    public readonly status: 'BORRADOR',
  ) {}

  public static create(props: {
    name: string;
    zoneId: number;
    executionDay: string;
    frequency: string;
    startTime?: string | null;
    endTime?: string | null;
    description?: string | null;
  }): Route {
    if (!props.name || !props.name.trim()) {
      throw new InvalidOperationException(
        'El nombre de la ruta es obligatorio',
      );
    }

    if (!props.zoneId || isNaN(Number(props.zoneId))) {
      throw new InvalidOperationException('La zona geográfica es obligatoria');
    }

    const trimmedDay = props.executionDay?.trim();
    if (
      !trimmedDay ||
      !VALID_DAYS.some((d) => d.toLowerCase() === trimmedDay.toLowerCase())
    ) {
      throw new InvalidOperationException(
        `Día de ejecución no válido. Valores permitidos: ${VALID_DAYS.join(', ')}`,
      );
    }

    const trimmedFrequency = props.frequency?.trim();
    if (
      !trimmedFrequency ||
      !VALID_FREQUENCIES.some(
        (f) => f.toLowerCase() === trimmedFrequency.toLowerCase(),
      )
    ) {
      throw new InvalidOperationException(
        `Frecuencia no válida. Valores permitidos: ${VALID_FREQUENCIES.join(', ')}`,
      );
    }

    if (props.startTime && props.endTime) {
      if (props.endTime <= props.startTime) {
        throw new InvalidOperationException(
          'La hora de fin debe ser posterior a la de inicio',
        );
      }
    }

    return new Route(
      props.name.trim(),
      Number(props.zoneId),
      trimmedDay,
      trimmedFrequency,
      props.startTime ?? null,
      props.endTime ?? null,
      props.description?.trim() ?? null,
      'BORRADOR', // Invariante de negocio: toda ruta nueva nace en BORRADOR
    );
  }
}
