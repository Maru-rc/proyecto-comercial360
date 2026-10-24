import { Inject, Injectable } from '@nestjs/common';
import type { RouteRepository } from '../ports/route.repository.port.js';
import { ROUTE_REPOSITORY } from '../ports/route.repository.port.js';
import type { RouteVisitGeneratorPort } from '../ports/route-visit-generator.port.js';
import { ROUTE_VISIT_GENERATOR } from '../ports/route-visit-generator.port.js';
import type { AdvisorReader } from '../../../../domain-contracts/advisors/advisor-reader.interface.js';
import {
  ADVISOR_READER,
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../../domain-contracts/index.js';
import { RouteAgendaCalculator } from '../../domain/services/route-agenda-calculator.js';

export interface AssignRouteCommand {
  routeId: number;
  advisorId: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AssignRouteResult {
  routeId: number;
  advisorId: number;
  status: 'ASIGNADA';
  totalVisitsGenerated: number;
}

@Injectable()
export class AssignRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routeRepository: RouteRepository,
    @Inject(ADVISOR_READER)
    private readonly advisorReader: AdvisorReader,
    @Inject(ROUTE_VISIT_GENERATOR)
    private readonly visitGenerator: RouteVisitGeneratorPort,
  ) {}

  async execute(command: AssignRouteCommand): Promise<AssignRouteResult> {
    const route = await this.routeRepository.findById(command.routeId);
    if (!route) {
      throw new EntityNotFoundException('Ruta no encontrada');
    }

    const advisorExists = await this.advisorReader.existsById(
      command.advisorId,
    );
    if (!advisorExists) {
      throw new InvalidOperationException(
        'El asesor seleccionado no existe o no se encuentra activo',
      );
    }

    const stops = await this.routeRepository.getStops(command.routeId);
    if (!stops || stops.length === 0) {
      throw new InvalidOperationException(
        'La ruta debe tener al menos una parada para ser asignada',
      );
    }

    const { startDate, endDate } = this.resolveDateRange(route, command);

    const visits = RouteAgendaCalculator.generateVisits({
      routeId: route.id,
      advisorId: command.advisorId,
      executionDay: route.executionDay,
      frequency: route.frequency,
      defaultStartTime: route.startTime,
      startDate,
      endDate,
      stops: stops.map((s) => ({
        customerId: s.customerId,
        visitOrder: s.visitOrder,
        suggestedTime: s.suggestedTime,
      })),
    });

    const totalGenerated = await this.visitGenerator.generateVisits(visits);

    await this.routeRepository.save({
      ...route,
      status: 'ASIGNADA',
      salesRepresentativeId: command.advisorId,
      startDate,
      endDate,
    });

    return {
      routeId: route.id,
      advisorId: command.advisorId,
      status: 'ASIGNADA',
      totalVisitsGenerated: totalGenerated,
    };
  }

  private resolveDateRange(
    route: { startDate?: Date | string | null; endDate?: Date | string | null },
    command: AssignRouteCommand,
  ): { startDate: Date; endDate: Date } {
    const rawStart = command.startDate ?? route.startDate;
    const startDate = rawStart ? new Date(rawStart) : new Date();

    const rawEnd = command.endDate ?? route.endDate;
    let endDate: Date;
    if (rawEnd) {
      endDate = new Date(rawEnd);
    } else {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 28);
    }

    return { startDate, endDate };
  }
}
