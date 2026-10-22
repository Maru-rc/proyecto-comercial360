import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case.js';
import type { AuthenticatedUser } from '../domain/authenticated-user.js';
import { Auth, CurrentUser } from './auth.decorator.js';
import { MeResponseDto } from './dto/me-response.dto.js';

// Es el único endpoint propio de autenticación. Iniciar y cerrar sesión y
// consultar la sesión los resuelve Better Auth en /api/auth/*.
@ApiTags('auth')
@Controller('me')
export class MeController {
  constructor(private readonly getMe: GetMeUseCase) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.getMe.execute(user);
  }
}
