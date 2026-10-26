import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case.js';
import type { AuthenticatedUser } from '../domain/authenticated-user.js';
import { Auth, CurrentUser } from './auth.decorator.js';
import { MeResponseDto } from './dto/me-response.dto.js';

@ApiTags('auth')
@Controller('me')
export class MeController {
  constructor(private readonly getMe: GetMeUseCase) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Profile of the authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.getMe.execute(user);
  }
}
