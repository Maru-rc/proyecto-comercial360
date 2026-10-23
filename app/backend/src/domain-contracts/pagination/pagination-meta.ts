export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Genera la metadata estándar de paginación para respuestas { data, meta }.
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
