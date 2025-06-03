import { Table as BootstrapTable, Spinner, Alert } from 'react-bootstrap';
import { useRef, useCallback } from 'react';

export type TableColumn<T> = { key: keyof T & string; label: string; sortBy?: boolean; render?: (row: T) => React.ReactNode };

type TableProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
};

export function CATable<T extends Record<string, unknown>>({
  data,
  columns,
  loading,
  error,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
  onEndReached,
}: TableProps<T> & { onEndReached?: () => void }) {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  // Lazy scroll handler
  const handleScroll = useCallback(() => {
    const el = tableBodyRef.current;
    if (!el || !onEndReached) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      onEndReached();
    }
  }, [onEndReached]);

  if (loading) return <Spinner animation="border" />;

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (!data.length) return <Alert variant="info">No data found.</Alert>;

  const handleSort = (col: TableColumn<T>) => {
    const newOrder: 'asc' | 'desc' = sortBy === col.key && sortOrder === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange(col.key, newOrder);
    }
  };

  const table = (
    <BootstrapTable striped bordered hover responsive>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={col.sortBy ? () => handleSort(col) : undefined}
              style={col.sortBy ? { cursor: 'pointer' } : {}}
            >
              {col.label} {sortBy === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody
        ref={tableBodyRef}
      >
        {data.map((item, index) => (
          <tr key={index} onClick={onRowClick ? () => onRowClick(item) : undefined} style={onRowClick ? { cursor: 'pointer' } : {}}>
            {columns.map(col => (
              <td key={col.key}>
                {col.render ? col.render(item) : String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </BootstrapTable>
  );

  if (onEndReached) {
    // Wrap in scrollable div and attach scroll handler
    return (
      <div
        style={{ maxHeight: 400, overflowY: 'auto' }}
        onScroll={handleScroll}
        ref={scrollableDivRef}
      >
        {table}
      </div>
    );
  }

  return table;
}

