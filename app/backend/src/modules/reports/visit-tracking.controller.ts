import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthGuard,
  RolesGuard,
  type RequestWithUser,
} from '../../domain-contracts/index.js';
import { GetVisitTrackingUseCase } from './application/use-cases/get-visit-tracking.use-case.js';
import { VisitTrackingQueryDto } from './application/dtos/visit-tracking-query.dto.js';
import { VisitTrackingResponseDto } from './application/dtos/visit-tracking-response.dto.js';

@ApiTags('visitas')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'No valid session found' })
@ApiForbiddenResponse({
  description: 'Advisor requesting another advisor, or advisor without record',
})
@UseGuards(AuthGuard, RolesGuard)
@Controller('visitas')
export class VisitTrackingController {
  constructor(private readonly getVisitTracking: GetVisitTrackingUseCase) {}

  @Get('seguimiento')
  @ApiOperation({
    summary: 'Get paginated visit tracking table with filters (HU-17)',
  })
  @ApiOkResponse({ type: VisitTrackingResponseDto })
  async getSeguimiento(
    @Query() query: VisitTrackingQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<VisitTrackingResponseDto> {
    const result = await this.getVisitTracking.execute(req.authUser!, query);
    return result as unknown as VisitTrackingResponseDto;
  }
}
