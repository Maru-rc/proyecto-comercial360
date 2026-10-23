export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Generates standard pagination metadata for { data, meta } HTTP responses.
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const sanitizedLimit = limit > 0 ? limit : 10;
  const sanitizedPage = page > 0 ? page : 1;
  const totalPages = Math.ceil(total / sanitizedLimit) || 1;

  return {
    total,
    page: sanitizedPage,
    limit: sanitizedLimit,
    totalPages,
    hasNextPage: sanitizedPage < totalPages,
    hasPreviousPage: sanitizedPage > 1,
  };
}
