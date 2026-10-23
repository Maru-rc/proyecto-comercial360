import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  AuthGuard,
  RolesGuard,
  type AuthenticatedUser,
} from '../auth/public-api.js';
import { GetWeeklyKpisUseCase } from './application/use-cases/get-weekly-kpis.use-case.js';
import { WeeklyKpisQueryDto } from './application/dtos/weekly-kpis-query.dto.js';
import { WeeklyKpisResponseDto } from './application/dtos/weekly-kpis-response.dto.js';

@ApiTags('dashboard')
@ApiCookieAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getWeeklyKpis: GetWeeklyKpisUseCase) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get weekly commercial KPIs' })
  @ApiOkResponse({ type: WeeklyKpisResponseDto })
  async getKpis(
    @Query() query: WeeklyKpisQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WeeklyKpisResponseDto> {
    return this.getWeeklyKpis.execute(user, query);
  }
}
