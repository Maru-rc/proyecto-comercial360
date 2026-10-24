import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  Auth,
  CurrentUser,
  ADVISOR_READER,
  type AuthenticatedUser,
} from '../../domain-contracts/index.js';
import type { AdvisorReader } from '../../domain-contracts/advisors/advisor-reader.interface.js';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case.js';
import { SetRouteStopsUseCase } from './application/use-cases/set-route-stops.use-case.js';
import { GetRouteByIdUseCase } from './application/use-cases/get-route-by-id.use-case.js';
import { AssignRouteUseCase } from './application/use-cases/assign-route.use-case.js';
import { CreateRouteDto } from './presentation/dto/create-route.dto.js';
import { SetRouteStopsDto } from './presentation/dto/set-route-stops.dto.js';
import { AssignRouteDto } from './presentation/dto/assign-route.dto.js';

@Controller('rutas')
export class RoutesController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly setRouteStopsUseCase: SetRouteStopsUseCase,
    private readonly getRouteByIdUseCase: GetRouteByIdUseCase,
    private readonly assignRouteUseCase: AssignRouteUseCase,
    @Inject(ADVISOR_READER)
    private readonly advisorReader: AdvisorReader,
  ) {}

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

  @Get('asesores')
  @Auth()
  async getAdvisors() {
    return this.advisorReader.listActive();
  }

  @Get(':id')
  @Auth()
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.getRouteByIdUseCase.execute(id);
  }

  @Put(':id/clientes')
  @Auth('DIRECTOR')
  async setClients(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRouteStopsDto,
  ) {
    const rawStops = dto.getStopsList();
    const mappedStops = rawStops.map((item) => ({
      customerId: item.resolvedCustomerId,
      visitOrder: item.resolvedVisitOrder,
      suggestedTime: item.resolvedSuggestedTime,
    }));
    return this.setRouteStopsUseCase.execute(id, mappedStops);
  }

  @Put(':id/paradas')
  @Auth('DIRECTOR')
  async setStops(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRouteStopsDto,
  ) {
    return this.setClients(id, dto);
  }

  @Post(':id/asignar')
  @Auth('DIRECTOR')
  @HttpCode(HttpStatus.OK)
  async assignRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRouteDto,
  ) {
    return this.assignRouteUseCase.execute({
      routeId: id,
      advisorId: dto.resolvedAdvisorId,
      startDate: dto.resolvedStartDate,
      endDate: dto.resolvedEndDate,
    });
  }
}
