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
        COUNT(*) AS scheduled,
        -- Recording a visit saves COMPLETED; VISITADO is kept for older rows
        COUNT(*) FILTER (WHERE visit_status IN ('COMPLETED', 'VISITADO')) AS completed
      FROM visits
      WHERE scheduled_at >= $1
        AND scheduled_at <  $2
    `;

    if (f.asesorId !== null) {
      params.push(f.asesorId);
      sql += ` AND sales_representative_id = $${params.length}`;
    }

    if (f.zoneId !== null) {
      params.push(f.zoneId);
      sql += `
        AND customer_id IN (
          SELECT customer_id FROM customers WHERE zone_id = $${params.length}
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
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM quotes
      WHERE date >= $1 AND date < $2
    `;

    if (f.asesorId !== null) {
      params.push(f.asesorId);
      sql += ` AND sales_representative_id = $${params.length}`;
    }

    if (f.zoneId !== null) {
      params.push(f.zoneId);
      sql += `
        AND customer_id IN (
          SELECT customer_id FROM customers WHERE zone_id = $${params.length}
        )
      `;
    }

    const rows = await this.db.query<{ total: string }[]>(sql, params);
    return Number(rows[0].total);
  }

  private async queryOrderStats(f: WeeklyKpisFilter): Promise<OrderStats> {
    const params: unknown[] = [f.weekStart, f.weekEnd];
    let sql = `
      SELECT
        COUNT(*)                AS closed_orders,
        COALESCE(SUM(amount), 0) AS billing
      FROM orders
      WHERE date >= $1 AND date < $2
    `;

    if (f.asesorId !== null) {
      params.push(f.asesorId);
      sql += `
        AND customer_id IN (
          SELECT DISTINCT customer_id
          FROM visits
          WHERE sales_representative_id = $${params.length}
        )
      `;
    }

    if (f.zoneId !== null) {
      params.push(f.zoneId);
      sql += `
        AND customer_id IN (
          SELECT customer_id FROM customers WHERE zone_id = $${params.length}
        )
      `;
    }

    const rows = await this.db.query<
      { closed_orders: string; billing: string }[]
    >(sql, params);
    const row = rows[0];

    return {
      closedOrders: Number(row.closed_orders),
      billing: Number(row.billing),
    };
  }

  private async queryWeeklyTarget(f: WeeklyKpisFilter): Promise<number> {
    if (f.asesorId === null) return 0;

    const params: unknown[] = [f.asesorId];
    let sql = `
      SELECT COUNT(*) AS target
      FROM route_stops rs
      JOIN routes r ON r.route_id = rs.route_id
      WHERE r.sales_representative_id = $1
        AND r.status <> 'BORRADOR'
    `;

    if (f.zoneId !== null) {
      params.push(f.zoneId);
      sql += ` AND r.zone_id = $${params.length}`;
    }

    const rows = await this.db.query<{ target: string }[]>(sql, params);
    return Number(rows[0].target);
  }
}
