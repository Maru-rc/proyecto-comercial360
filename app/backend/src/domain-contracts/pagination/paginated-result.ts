import { PaginationMeta, createPaginationMeta } from './pagination-meta.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Empaqueta una lista de elementos en el contrato estándar { data, meta } de Comercial360.
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
