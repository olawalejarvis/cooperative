import React from 'react';
import type { Transaction } from '../store/transaction';
import { CATable } from './CATable';
import type { SortOrder } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  onRowClick?: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading, error, sortBy, sortOrder, onSortChange, onRowClick }) => {
  const handleSort = (field: string) => {
    const newOrder: SortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  };

  const columns = React.useMemo(() => [
    { key: 'createdAt' as const, label: 'Date', sortBy: true },
    { key: 'type' as const, label: 'Type', sortBy: true },
    { key: 'amount' as const, label: 'Amount', sortBy: true },
    { key: 'status' as const, label: 'Status', sortBy: true },
    { key: 'method' as const, label: 'Method', sortBy: true },
  ], []);

  const mappedData = React.useMemo(() =>
    (transactions || []).map(tx => ({
      ...tx,
      amount: tx.formattedAmount, // display formattedAmount, but keep key as 'amount'
      createdAt: new Date(tx.createdAt).toLocaleString(),
    })),
    [transactions]
  );

  return (
    <CATable
      columns={columns}
      data={mappedData}
      loading={loading}
      error={error}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={handleSort}
      onRowClick={onRowClick}
    />
  );
};

export default TransactionTable;
