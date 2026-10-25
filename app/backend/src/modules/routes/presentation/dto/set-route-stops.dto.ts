import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RouteStopItemDto {
  @IsOptional()
  @IsNumber()
  id_cliente?: number;

  @IsOptional()
  @IsNumber()
  cliente_id?: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  orden?: number;

  @IsOptional()
  @IsNumber()
  visitOrder?: number;

  @IsOptional()
  @IsString()
  hora_sugerida?: string;

  @IsOptional()
  @IsString()
  suggestedTime?: string;

  get resolvedCustomerId(): number {
    return (this.id_cliente ?? this.cliente_id ?? this.customerId) as number;
  }

  get resolvedVisitOrder(): number | undefined {
    return this.orden ?? this.visitOrder;
  }

  get resolvedSuggestedTime(): string | null {
    return this.hora_sugerida ?? this.suggestedTime ?? null;
  }
}

export class SetRouteStopsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopItemDto)
  paradas?: RouteStopItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopItemDto)
  clientes?: RouteStopItemDto[];

  getStopsList(): RouteStopItemDto[] {
    return this.paradas ?? this.clientes ?? [];
  }
}
