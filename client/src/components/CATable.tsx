import { Table as BootstrapTable, Spinner, Alert } from 'react-bootstrap';

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
}: TableProps<T>) {
  if (loading) return <Spinner animation="border" />;

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (!data.length) return <Alert variant="info">No data found.</Alert>;

  const handleSort = (col: TableColumn<T>) => {
    const newOrder: 'asc' | 'desc' = sortBy === col.key && sortOrder === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange(col.key, newOrder);
    }
  };

  return (
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
      <tbody>
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
}

