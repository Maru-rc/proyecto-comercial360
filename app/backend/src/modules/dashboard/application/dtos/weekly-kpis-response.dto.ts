import { ApiProperty } from '@nestjs/swagger';

/** Weekly goal card: target vs completed visits. */
export class WeeklyGoalDto {
  @ApiProperty({ example: 12 })
  target: number;

  @ApiProperty({ example: 9 })
  completed: number;

  @ApiProperty({ example: 75.0 })
  percentage: number;
}

/**
 * Response shape for GET /dashboard/kpis.
 * Monetary values are raw numbers (COP); formatting is the frontend's job.
 */
export class WeeklyKpisResponseDto {
  /** Resolved ISO week that was queried (e.g. "2026-W42"). */
  @ApiProperty({ example: '2026-W42' })
  week: string;

  /** Total visits scheduled in the week. */
  @ApiProperty({ example: 12 })
  scheduledVisits: number;

  /** Visits with estado_visita = 'VISITADO'. */
  @ApiProperty({ example: 9 })
  completedVisits: number;

  /** completedVisits / scheduledVisits × 100. 0 when no visits scheduled. */
  @ApiProperty({ example: 75.0 })
  effectivenessRate: number;

  /** SUM of cotizacion.valor in the week. */
  @ApiProperty({ example: 215450000 })
  quotedValue: number;

  /** COUNT of pedido rows in the week. */
  @ApiProperty({ example: 4 })
  closedOrders: number;

  /** SUM of pedido.valor in the week. */
  @ApiProperty({ example: 98300000 })
  routeBilling: number;

  /** Weekly goal card. */
  @ApiProperty({ type: WeeklyGoalDto })
  weeklyGoal: WeeklyGoalDto;
}
