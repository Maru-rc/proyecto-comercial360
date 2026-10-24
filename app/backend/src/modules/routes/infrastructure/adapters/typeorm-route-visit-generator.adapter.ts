import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { RouteVisitGeneratorPort } from '../../application/ports/route-visit-generator.port.js';
import type { GeneratedVisit } from '../../domain/services/route-agenda-calculator.js';

@Injectable()
export class TypeOrmRouteVisitGeneratorAdapter implements RouteVisitGeneratorPort {
  constructor(private readonly dataSource: DataSource) {}

  async generateVisits(visits: GeneratedVisit[]): Promise<number> {
    if (!visits || visits.length === 0) return 0;

    return this.dataSource.transaction(async (manager) => {
      // Opcional: limpiar visitas previas no ejecutadas de esta ruta si se reasigna
      const routeId = visits[0].routeId;
      await manager.query(
        `DELETE FROM "visits" WHERE "route_id" = $1 AND "visit_status" = 'PENDIENTE'`,
        [routeId],
      );

      for (const visit of visits) {
        await manager.query(
          `INSERT INTO "visits" ("customer_id", "sales_representative_id", "route_id", "scheduled_at", "visit_status")
           VALUES ($1, $2, $3, $4, $5)`,
          [
            visit.customerId,
            visit.salesRepresentativeId,
            visit.routeId,
            visit.scheduledAt,
            visit.status,
          ],
        );
      }

      return visits.length;
    });
  }
}
