import { describe, expect, it } from 'vitest';
import {
  PaginationQueryDto,
  createPaginationMeta,
  createPaginatedResult,
} from './index.js';

describe('Pagination Contract & Helpers (Clean Architecture)', () => {
  it('PaginationQueryDto should provide sensible defaults for page, limit, skip, and take', () => {
    const query = new PaginationQueryDto();

    expect(query.page).toBe(1);
    expect(query.limit).toBe(10);
    expect(query.skip).toBe(0);
    expect(query.take).toBe(10);
    expect(query.normalizedSortOrder).toBe('ASC');
  });

  it('PaginationQueryDto should calculate skip and take accurately for arbitrary pages', () => {
    const query = new PaginationQueryDto();
    query.page = 4;
    query.limit = 25;
    query.sortOrder = 'desc';

    expect(query.skip).toBe(75);
    expect(query.take).toBe(25);
    expect(query.normalizedSortOrder).toBe('DESC');
  });

  it('createPaginationMeta should accurately calculate totalPages and navigation flags', () => {
    // 45 items, 10 per page -> 5 pages
    const page1Meta = createPaginationMeta(45, 1, 10);
    expect(page1Meta.totalPages).toBe(5);
    expect(page1Meta.hasNextPage).toBe(true);
    expect(page1Meta.hasPreviousPage).toBe(false);

    const page5Meta = createPaginationMeta(45, 5, 10);
    expect(page5Meta.hasNextPage).toBe(false);
    expect(page5Meta.hasPreviousPage).toBe(true);

    // Edge case: 0 items
    const zeroMeta = createPaginationMeta(0, 1, 10);
    expect(zeroMeta.totalPages).toBe(1);
    expect(zeroMeta.hasNextPage).toBe(false);
    expect(zeroMeta.hasPreviousPage).toBe(false);
  });

  it('createPaginatedResult should return { data, meta } structure conforming to API standard', () => {
    const mockItems = [{ id: 1, name: 'Visita 1' }];
    const result = createPaginatedResult(mockItems, 50, 2, 10);

    expect(result.data).toEqual(mockItems);
    expect(result.meta).toEqual({
      total: 50,
      page: 2,
      limit: 10,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
