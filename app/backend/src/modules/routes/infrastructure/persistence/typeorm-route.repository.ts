import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  RouteRecord,
  RouteRepository,
  RouteStopRecord,
} from '../../application/ports/route.repository.port.js';
import {
  RouteReader,
  RouteContractDto,
  RouteStopContractDto,
} from '../../../../domain-contracts/index.js';
import { RouteOrmEntity } from './entities/route.orm-entity.js';
import { RouteStopOrmEntity } from './entities/route-stop.orm-entity.js';

@Injectable()
export class TypeOrmRouteRepository implements RouteRepository, RouteReader {
  private readonly routeRepo: Repository<RouteOrmEntity>;
  private readonly stopRepo: Repository<RouteStopOrmEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.routeRepo = this.dataSource.getRepository(RouteOrmEntity);
    this.stopRepo = this.dataSource.getRepository(RouteStopOrmEntity);
  }

  async save(data: Partial<RouteRecord>): Promise<RouteRecord> {
    const routeOrm = this.routeRepo.create({
      // With an id TypeORM updates the route; without it, it inserts a new one
      id: data.id,
      name: data.name,
      zoneId: data.zoneId,
      executionDay: data.executionDay,
      frequency: data.frequency,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      status: data.status ?? 'BORRADOR',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      salesRepresentativeId: data.salesRepresentativeId,
    });

    const saved = await this.routeRepo.save(routeOrm);
    return this.mapToRecord(saved);
  }

  async findById(id: number): Promise<RouteRecord | null> {
    const route = await this.routeRepo.findOne({
      where: { id },
    });
    return route ? this.mapToRecord(route) : null;
  }

  async findAll(filter: { advisorId?: number } = {}): Promise<RouteRecord[]> {
    const routes = await this.routeRepo.find({
      where:
        filter.advisorId === undefined
          ? {}
          : { salesRepresentativeId: filter.advisorId },
      order: { id: 'DESC' },
    });
    return routes.map((route) => this.mapToRecord(route));
  }

  async existsByName(name: string): Promise<boolean> {
    return this.routeRepo.exists({
      where: { name: name.trim() },
    });
  }

  async setStops(
    routeId: number,
    stops: Array<{
      customerId: number;
      visitOrder: number;
      suggestedTime?: string | null;
    }>,
  ): Promise<RouteStopRecord[]> {
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(RouteStopOrmEntity, { routeId });

      if (stops.length === 0) {
        return [];
      }

      const stopEntities = stops.map((s) =>
        manager.create(RouteStopOrmEntity, {
          routeId,
          customerId: s.customerId,
          visitOrder: s.visitOrder,
          suggestedTime: s.suggestedTime ?? null,
        }),
      );

      const saved = await manager.save(RouteStopOrmEntity, stopEntities);
      return saved.map((s) => ({
        id: s.id,
        routeId: s.routeId,
        customerId: s.customerId,
        visitOrder: s.visitOrder,
        suggestedTime: s.suggestedTime,
      }));
    });
  }

  async getStops(routeId: number): Promise<RouteStopRecord[]> {
    const stops = await this.stopRepo.find({
      where: { routeId },
      order: { visitOrder: 'ASC' },
    });
    return stops.map((s) => ({
      id: s.id,
      routeId: s.routeId,
      customerId: s.customerId,
      visitOrder: s.visitOrder,
      suggestedTime: s.suggestedTime,
    }));
  }

  // Métodos del contrato público RouteReader
  async getRouteById(id: number): Promise<RouteContractDto | null> {
    const route = await this.routeRepo.findOne({ where: { id } });
    if (!route) return null;
    return {
      id: route.id,
      name: route.name,
      description: route.description,
      territoryId: route.zoneId,
      advisorId: route.salesRepresentativeId,
      executionDay: route.executionDay,
      frequency: route.frequency,
      status: route.status,
      startTime: route.startTime,
      endTime: route.endTime,
      startDate: route.startDate,
      endDate: route.endDate,
    };
  }

  async getStopsByRouteId(routeId: number): Promise<RouteStopContractDto[]> {
    const stops = await this.stopRepo.find({
      where: { routeId },
      order: { visitOrder: 'ASC' },
    });
    return stops.map((s) => ({
      id: s.id,
      routeId: s.routeId,
      clientId: s.customerId,
      visitOrder: s.visitOrder,
      order: s.visitOrder,
      suggestedTime: s.suggestedTime,
    }));
  }

  private mapToRecord(entity: RouteOrmEntity): RouteRecord {
    return {
      id: entity.id,
      name: entity.name,
      zoneId: entity.zoneId,
      zoneName: null,
      executionDay: entity.executionDay,
      frequency: entity.frequency,
      startTime: entity.startTime,
      endTime: entity.endTime,
      description: entity.description,
      status: (entity.status as RouteRecord['status']) || 'BORRADOR',
      startDate: entity.startDate,
      endDate: entity.endDate,
      salesRepresentativeId: entity.salesRepresentativeId,
    };
  }
}
