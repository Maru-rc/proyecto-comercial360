import { ApiProperty } from '@nestjs/swagger';
import { ROLES, type UserRole } from '../../domain/role.js';

class AdvisorDto {
  @ApiProperty({ example: 1 }) idAdvisor: number;
  @ApiProperty({ example: '3001234567', nullable: true }) phone: string | null;
  @ApiProperty({ example: 'ACTIVE' }) status: string;
}

export class MeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Juan Pérez' }) name: string;
  @ApiProperty({ example: 'juan.perez@comercial360.com' }) email: string;
  @ApiProperty({ enum: ROLES }) role: UserRole;
  @ApiProperty({
    type: AdvisorDto,
    nullable: true,
    description: 'Advisor linked by email; null for director',
  })
  advisor: AdvisorDto | null;
}
