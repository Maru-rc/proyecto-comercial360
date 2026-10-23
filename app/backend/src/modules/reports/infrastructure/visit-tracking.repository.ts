import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  IVisitTrackingRepository,
  VisitTrackingFilter,
  VisitTrackingPage,
  VisitTrackingRow,
} from '../application/ports/visit-tracking.port.js';

interface TrackingSqlRow {
  visit_id: string | number;
  scheduled_at: Date | string;
  advisor_name: string | null;
  territory: string | null;
  week: string | number;
  day: string;
  route_name: string | null;
  customer_name: string;
  municipality: string | null;
  customer_type: string | null;
  potential: string | null;
  visit_status: string;
  outcome_name: string | null;
  quote_number: string | null;
  quote_amount: string | number | null;
  order_number: string | null;
  next_follow_up_date: Date | string | null;
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class VisitTrackingRepository implements IVisitTrackingRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  private buildSelectClause(): string {
    return `
      SELECT
        v.visit_id,
        v.scheduled_at,
        sr.name AS advisor_name,
        z.name AS territory,
        EXTRACT(WEEK FROM v.scheduled_at) AS week,
        TRIM(TO_CHAR(v.scheduled_at, 'Day')) AS day,
        r.name AS route_name,
        COALESCE(c.commercial_name, c.legal_name) AS customer_name,
        c.municipality,
        ct.name AS customer_type,
        p.name AS potential,
        v.visit_status,
        outcome.outcome_name,
        q.quote_number,
        q.quote_amount,
        o.order_number,
        fu.next_date AS next_follow_up_date
    `;
  }

  async findPage(filter: VisitTrackingFilter): Promise<VisitTrackingPage> {
    const whereSql = this.buildWhereSql(filter);
    const pageParams: unknown[] = [
      ...whereSql.params,
      filter.limit,
      (filter.page - 1) * filter.limit,
    ];
    const limitIdx = whereSql.params.length + 1;
    const offsetIdx = whereSql.params.length + 2;

    const [countRows, dataRows] = await Promise.all([
      this.db.query<{ total: string }[]>(
        `SELECT COUNT(*) AS total${this.buildFromSql()}${whereSql.sql}`,
        whereSql.params,
      ),
      this.db.query<TrackingSqlRow[]>(
        `
        ${this.buildSelectClause()}
        ${this.buildFromSql()}
        ${whereSql.sql}
        ORDER BY v.scheduled_at DESC, v.visit_id DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `,
        pageParams,
      ),
    ]);

    return {
      total: Number(countRows[0]?.total ?? 0),
      rows: dataRows.map((row) => this.toDomainRow(row)),
    };
  }

  async findAll(filter: VisitTrackingFilter): Promise<VisitTrackingRow[]> {
    const whereSql = this.buildWhereSql(filter);
    const dataRows = await this.db.query<TrackingSqlRow[]>(
      `
      ${this.buildSelectClause()}
      ${this.buildFromSql()}
      ${whereSql.sql}
      ORDER BY v.scheduled_at DESC, v.visit_id DESC
      `,
      whereSql.params,
    );

    return dataRows.map((row) => this.toDomainRow(row));
  }

  private toDomainRow(row: TrackingSqlRow): VisitTrackingRow {
    return {
      visitId: Number(row.visit_id),
      date: formatDate(row.scheduled_at),
      advisorName: row.advisor_name,
      territory: row.territory,
      week: Number(row.week),
      day: row.day,
      route: row.route_name,
      customer: row.customer_name,
      municipality: row.municipality,
      customerType: row.customer_type,
      potential: row.potential,
      visitStatus: row.visit_status,
      outcome: row.outcome_name,
      quoteNumber: row.quote_number,
      quoteAmount: Number(row.quote_amount ?? 0),
      orderNumber: row.order_number,
      nextFollowUpDate: row.next_follow_up_date
        ? formatDate(row.next_follow_up_date)
        : null,
    };
  }

  private buildWhereSql(filter: VisitTrackingFilter): {
    sql: string;
    params: unknown[];
  } {
    const params: unknown[] = [];
    let sql = ` WHERE 1 = 1`;

    if (filter.period === 'today') {
      sql += ` AND v.scheduled_at::date = CURRENT_DATE`;
    } else if (filter.period === 'month') {
      sql += ` AND v.scheduled_at >= date_trunc('month', CURRENT_DATE)
           AND v.scheduled_at <  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`;
    } else {
      sql += ` AND v.scheduled_at >= date_trunc('week', CURRENT_DATE)
         AND v.scheduled_at <  date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'`;
    }

    if (filter.status !== null) {
      params.push(filter.status);
      sql += ` AND UPPER(v.visit_status) = UPPER($${params.length})`;
    }

    if (filter.routeId !== null) {
      params.push(filter.routeId);
      sql += ` AND v.route_id = $${params.length}`;
    }

    if (filter.customerType !== null) {
      params.push(filter.customerType);
      sql += ` AND ct.name = $${params.length}`;
    }

    if (filter.potential !== null) {
      params.push(filter.potential);
      sql += ` AND p.name = $${params.length}`;
    }

    if (filter.advisorId !== null) {
      params.push(filter.advisorId);
      sql += ` AND v.sales_representative_id = $${params.length}`;
    }

    return { sql, params };
  }

  private buildFromSql(): string {
    return `
      FROM visits v
      LEFT JOIN sales_representatives sr
        ON sr.sales_representative_id = v.sales_representative_id
      LEFT JOIN customers c
        ON c.customer_id = v.customer_id
      LEFT JOIN routes r
        ON r.route_id = v.route_id
      LEFT JOIN zones z
        ON z.zone_id = COALESCE(r.zone_id, c.zone_id)
      LEFT JOIN customer_types ct
        ON ct.customer_type_id = c.customer_type_id
      LEFT JOIN potentials p
        ON p.potential_id = c.potential_id
      LEFT JOIN LATERAL (
        SELECT vo.name AS outcome_name
        FROM visit_results vr
        JOIN visit_outcomes vo
          ON vo.visit_outcome_id = vr.visit_outcome_id
        WHERE vr.visit_id = v.visit_id
        ORDER BY vr.visit_result_id DESC
        LIMIT 1
      ) outcome ON true
      LEFT JOIN LATERAL (
        SELECT q.quote_number, q.amount AS quote_amount
        FROM quotes q
        WHERE q.customer_id = v.customer_id
        ORDER BY q.date DESC, q.quote_id DESC
        LIMIT 1
      ) q ON true
      LEFT JOIN LATERAL (
        SELECT o.order_number
        FROM orders o
        WHERE o.customer_id = v.customer_id
        ORDER BY o.date DESC, o.order_id DESC
        LIMIT 1
      ) o ON true
      LEFT JOIN LATERAL (
        SELECT f.next_date
        FROM follow_ups f
        WHERE f.visit_id = v.visit_id AND f.is_completed = false
        ORDER BY f.next_date ASC
        LIMIT 1
      ) fu ON true
    `;
  }
}
