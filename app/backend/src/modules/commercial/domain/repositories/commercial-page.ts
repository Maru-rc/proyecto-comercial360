/** Page of commercial documents, newest first, optionally for one advisor. */
export interface CommercialPageFilter {
  advisorId: number | null;
  page: number;
  limit: number;
}

export interface CommercialPage<T> {
  items: T[];
  total: number;
}
