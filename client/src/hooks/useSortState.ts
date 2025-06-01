import { useState } from 'react';
import type { SortOrder } from '../types';

/**
 * Custom hook for managing sort state for tables.
 * @param defaultField The default field to sort by.
 * @param defaultOrder The default sort order ('asc' or 'desc').
 */
export function useSortState(defaultField: string, defaultOrder: SortOrder) {
  const [sortBy, setSortBy] = useState<string>(defaultField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);
  const handleSortChange = (field: string, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };
  return { sortBy, sortOrder, handleSortChange };
}
