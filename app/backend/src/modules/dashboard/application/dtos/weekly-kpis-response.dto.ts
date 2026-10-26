import { ApiProperty } from '@nestjs/swagger';

export class WeeklyGoalDto {
  @ApiProperty({ example: 12 })
  target: number;

  @ApiProperty({ example: 9 })
  completed: number;

  @ApiProperty({ example: 75.0 })
  percentage: number;
}

export class WeeklyKpisResponseDto {
  @ApiProperty({ example: '2026-W42' })
  week: string;

  @ApiProperty({ example: 12 })
  scheduledVisits: number;

  @ApiProperty({ example: 9 })
  completedVisits: number;

  @ApiProperty({ example: 75.0 })
  effectivenessRate: number;

  @ApiProperty({ example: 215450000 })
  quotedValue: number;

  @ApiProperty({ example: 4 })
  closedOrders: number;

  @ApiProperty({ example: 98300000 })
  routeBilling: number;

  @ApiProperty({ type: WeeklyGoalDto })
  weeklyGoal: WeeklyGoalDto;
}
