import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  VALID_DAYS,
  VALID_FREQUENCIES,
} from '../../domain/entities/route.entity.js';

export class CreateRouteDto {
  @IsNotEmpty({ message: 'El nombre de la ruta es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'La zona geográfica es obligatoria' })
  @IsInt({ message: 'La zona geográfica debe ser un ID numérico válido' })
  zona_id: number;

  @IsNotEmpty({ message: 'El día de ejecución es obligatorio' })
  @IsIn(VALID_DAYS as unknown as string[], {
    message: `Día de ejecución no válido. Debe ser uno de: ${VALID_DAYS.join(', ')}`,
  })
  dia_ejecucion: string;

  @IsNotEmpty({ message: 'La frecuencia es obligatoria' })
  @IsIn(VALID_FREQUENCIES as unknown as string[], {
    message: `Frecuencia no válida. Debe ser una de: ${VALID_FREQUENCIES.join(', ')}`,
  })
  frecuencia: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'La hora de inicio debe tener formato HH:mm (ej. 08:00)',
  })
  hora_inicio?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'La hora de fin debe tener formato HH:mm (ej. 17:00)',
  })
  hora_fin?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
