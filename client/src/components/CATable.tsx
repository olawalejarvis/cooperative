import { Table as BootstrapTable, Spinner, Alert } from 'react-bootstrap';
import { useRef, useCallback } from 'react';
import './CATable.css'; // Add a CSS file for custom styles

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
    <div className="catable-financial-wrapper">
      <BootstrapTable
        className="catable-financial table-borderless align-middle shadow-sm"
        striped={false}
        bordered={false}
        hover
        responsive
      >
        <thead className="catable-thead">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={col.sortBy ? () => handleSort(col) : undefined}
                style={col.sortBy ? { cursor: 'pointer', userSelect: 'none' } : {}}
                className={col.sortBy ? 'catable-sortable' : ''}
              >
                <span>{col.label}</span>
                {sortBy === col.key && (
                  <span className="catable-sort-indicator ms-1">
                    {sortOrder === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 4l4 6H4l4-6z" fill="#3b82f6"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 12l-4-6h8l-4 6z" fill="#3b82f6"/></svg>
                    )}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
          {data.map((item, index) => (
            <tr key={index} onClick={onRowClick ? () => onRowClick(item) : undefined} style={onRowClick ? { cursor: 'pointer' } : {}} className="catable-row">
              {columns.map(col => (
                <td key={col.key} className="catable-cell">
                  {col.render ? col.render(item) : String(item[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </BootstrapTable>
    </div>
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

