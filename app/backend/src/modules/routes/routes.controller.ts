import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  Auth,
  CurrentUser,
  type AuthenticatedUser,
} from '../../domain-contracts/index.js';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case.js';
import { CreateRouteDto } from './presentation/dto/create-route.dto.js';

@Controller('rutas')
export class RoutesController {
  constructor(private readonly createRouteUseCase: CreateRouteUseCase) {}

  @Post()
  @Auth('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateRouteDto,
    @CurrentUser() _user: AuthenticatedUser,
  ) {
    return this.createRouteUseCase.execute({
      name: dto.nombre,
      zoneId: dto.zona_id,
      executionDay: dto.dia_ejecucion,
      frequency: dto.frecuencia,
      startTime: dto.hora_inicio,
      endTime: dto.hora_fin,
      description: dto.descripcion,
    });
  }
}
