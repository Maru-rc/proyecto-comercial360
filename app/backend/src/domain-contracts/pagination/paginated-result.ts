import { PaginationMeta, createPaginationMeta } from './pagination-meta.js';

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

/**
 * Wraps an array of items into the standard { data, meta } contract for Comercial360.
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data: items,
    meta: createPaginationMeta(total, page, limit),
  };
}
