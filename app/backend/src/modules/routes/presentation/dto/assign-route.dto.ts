import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AssignRouteDto {
  @IsOptional()
  @IsNumber()
  id_asesor?: number;

  @IsOptional()
  @IsNumber()
  asesor_id?: number;

  @IsOptional()
  @IsNumber()
  advisorId?: number;

  @IsOptional()
  @IsNumber()
  salesRepresentativeId?: number;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  get resolvedAdvisorId(): number {
    return (this.id_asesor ??
      this.asesor_id ??
      this.advisorId ??
      this.salesRepresentativeId) as number;
  }

  get resolvedStartDate(): string | null {
    return this.fecha_inicio ?? this.startDate ?? null;
  }

  get resolvedEndDate(): string | null {
    return this.fecha_fin ?? this.endDate ?? null;
  }
}
