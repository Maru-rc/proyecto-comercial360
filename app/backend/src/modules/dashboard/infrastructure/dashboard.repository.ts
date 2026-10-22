import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  IDashboardRepository,
  OrderStats,
  VisitStats,
  WeeklyKpisFilter,
  WeeklyKpisRaw,
} from '../application/ports/dashboard.repository.port.js';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getWeeklyKpis(filter: WeeklyKpisFilter): Promise<WeeklyKpisRaw> {
    const [visits, quotedValue, orders, weeklyTarget] = await Promise.all([
      this.queryVisitStats(filter),
      this.queryQuotedValue(filter),
      this.queryOrderStats(filter),
      this.queryWeeklyTarget(filter),
    ]);

    return { visits, quotedValue, orders, weeklyTarget };
  }

  private async queryVisitStats(f: WeeklyKpisFilter): Promise<VisitStats> {
    const params: unknown[] = [f.weekStart, f.weekEnd];
    let sql = `
      SELECT
        COUNT(*)                                              AS scheduled,
        COUNT(*) FILTER (WHERE estado_visita = 'VISITADO')   AS completed
      FROM visita
      WHERE fecha_programada >= $1
        AND fecha_programada <  $2
    `;

    if (f.asesorId !== null) {
      params.push(f.asesorId);
      sql += ` AND id_asesor = $${params.length}`;
    }

    if (f.zonaId !== null) {
      params.push(f.zonaId);
      sql += `
        AND id_cliente IN (
          SELECT id_cliente FROM cliente WHERE id_zona = $${params.length}
        )
      `;
    }

    const rows = await this.db.query<
      { scheduled: string; completed: string }[]
    >(sql, params);
    const row = rows[0];

    return {
      scheduled: Number(row.scheduled),
      completed: Number(row.completed),
    };
  }

  private async queryQuotedValue(f: WeeklyKpisFilter): Promise<number> {
    const params: unknown[] = [f.weekStart, f.weekEnd];
    let sql = `
      SELECT COALESCE(SUM(valor), 0) AS total
      FROM cotizacion
      WHERE fecha >= $1 AND fecha < $2
    `;

    if (f.asesorId !== null) {
      params.push(f.asesorId);
      sql += ` AND id_asesor = $${params.length}`;
    }

    const rows = await this.db.query<{ total: string }[]>(sql, params);
    return Number(rows[0].total);
  }

  private async queryOrderStats(f: WeeklyKpisFilter): Promise<OrderStats> {
    const params: unknown[] = [f.weekStart, f.weekEnd];
    let sql = `
      SELECT
        COUNT(*)                AS closed_orders,
        COALESCE(SUM(valor), 0) AS billing
      FROM pedido
      WHERE fecha >= $1 AND fecha < $2
    `;

    if (f.asesorId !== null) {
      params.push(f.asesorId);
      sql += `
        AND id_cliente IN (
          SELECT DISTINCT id_cliente FROM visita WHERE id_asesor = $${params.length}
        )
      `;
    }

    if (f.zonaId !== null) {
      params.push(f.zonaId);
      sql += `
        AND id_cliente IN (
          SELECT id_cliente FROM cliente WHERE id_zona = $${params.length}
        )
      `;
    }

    const rows = await this.db.query<
      {
        closed_orders: string;
        billing: string;
      }[]
    >(sql, params);
    const row = rows[0];

    return {
      closedOrders: Number(row.closed_orders),
      billing: Number(row.billing),
    };
  }

  private async queryWeeklyTarget(f: WeeklyKpisFilter): Promise<number> {
    if (f.asesorId === null) return 0;

    const rows = await this.db.query<{ target: string }[]>(
      `
      SELECT COUNT(*) AS target
      FROM ruta_cliente rc
      JOIN ruta r ON r.id_ruta = rc.id_ruta
      WHERE r.id_asesor = $1
        AND r.estado = 'EN_EJECUCION'
      `,
      [f.asesorId],
    );

    return Number(rows[0].target);
  }
}
