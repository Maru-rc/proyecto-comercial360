import { useState } from 'react';

/**
 * Current page of a list paginated in the browser. It goes back to page 1
 * whenever a filter changes: a search done from page 3 would otherwise show
 * an empty page even when it has results.
 */
export const usePageReset = (filters: readonly unknown[]) => {
  const [page, setPage] = useState(1);
  const key = JSON.stringify(filters);
  const [lastKey, setLastKey] = useState(key);
  // Adjusting state during render avoids one frame with the stale page
  if (key !== lastKey) {
    setLastKey(key);
    setPage(1);
  }
  return [page, setPage] as const;
};
