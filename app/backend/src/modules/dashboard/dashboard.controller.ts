import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/presentation/auth.guard.js';
import type { RequestWithUser } from '../auth/presentation/auth.guard.js';
import { RolesGuard } from '../auth/presentation/roles.guard.js';
import { GetWeeklyKpisUseCase } from './application/use-cases/get-weekly-kpis.use-case.js';
import { WeeklyKpisQueryDto } from './application/dtos/weekly-kpis-query.dto.js';
import { WeeklyKpisResponseDto } from './application/dtos/weekly-kpis-response.dto.js';

@ApiTags('dashboard')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'No valid session found' })
@ApiForbiddenResponse({
  description: 'Advisor requesting another advisor, or advisor without record',
})
@UseGuards(AuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getWeeklyKpis: GetWeeklyKpisUseCase) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get weekly commercial KPIs' })
  @ApiOkResponse({ type: WeeklyKpisResponseDto })
  async getKpis(
    @Query() query: WeeklyKpisQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<WeeklyKpisResponseDto> {
    return this.getWeeklyKpis.execute(req.authUser!, query);
  }
}
