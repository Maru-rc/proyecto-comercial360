import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListAgendaQueryDto {
  @ApiPropertyOptional({
    description: 'Agenda date (YYYY-MM-DD)',
    example: '2026-10-22',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date?: string;

  @ApiPropertyOptional({ description: 'Target advisor ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  advisorId?: number;

  get targetDate(): string {
    return this.date ?? new Date().toISOString().slice(0, 10);
  }

  get targetAdvisorId(): number | undefined {
    return this.advisorId;
  }
}

export class GetMapQueryDto extends ListAgendaQueryDto {}
