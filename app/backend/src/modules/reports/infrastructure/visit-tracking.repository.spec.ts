import { describe, expect, it, vi } from 'vitest';
import type { DataSource } from 'typeorm';
import { VisitTrackingRepository } from './visit-tracking.repository.js';

describe('VisitTrackingRepository', () => {
  it('takes the quote and the order of each visit, not the latest of its client', async () => {
    const query = vi.fn().mockResolvedValue([]);
    const repository = new VisitTrackingRepository({
      query,
    } as unknown as DataSource);

    await repository.findAll({
      period: 'month',
      status: null,
      routeId: null,
      customerType: null,
      potential: null,
      advisorId: null,
      page: 1,
      limit: 100,
    });

    // By client, every visit (even a pending one) repeated the same quote and
    // order, which inflated the ranking and the CSV export
    const sql = query.mock.calls[0][0] as string;
    expect(sql).toContain('q.visit_id = v.visit_id');
    expect(sql).toContain('o.visit_id = v.visit_id');
    expect(sql).not.toContain('q.customer_id = v.customer_id');
    expect(sql).not.toContain('o.customer_id = v.customer_id');
  });
});
