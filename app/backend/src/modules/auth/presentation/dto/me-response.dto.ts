import { ApiProperty } from '@nestjs/swagger';

class AsesorDto {
  @ApiProperty({ example: 1 }) id_asesor: number;
  @ApiProperty({ example: '3001234567', nullable: true }) telefono:
    string | null;
  @ApiProperty({ example: 'ACTIVE' }) estado: string;
}

export class MeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Juan Pérez' }) nombre: string;
  @ApiProperty({ example: 'juan.perez@comercial360.com' }) email: string;
  @ApiProperty({ enum: ['ASESOR', 'DIRECTOR'] }) rol: 'ASESOR' | 'DIRECTOR';
  @ApiProperty({
    type: AsesorDto,
    nullable: true,
    description: 'Datos del asesor vinculado por correo; null para el director',
  })
  asesor: AsesorDto | null;
}
