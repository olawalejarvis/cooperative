import React from 'react';
import type { Transaction } from '../store/transaction';
import { CATable } from './CATable';
import type { SortOrder } from '../types';
import { useAuthStore } from '../store/auth';
import { Button } from 'react-bootstrap';
import { CAModal } from './CAModal';
import { useTransactionStore } from '../store/transaction';
import { UserPermission } from '../utils/UserPermission';

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

  const [showModal, setShowModal] = React.useState(false);
  const [deleteTx, setDeleteTx] = React.useState<Transaction | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = UserPermission.isSuperAdmin(currentUser?.role);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  const handleDeleteClick = (row: Record<string, unknown>) => {
    setDeleteTx(row as Transaction);
    setShowModal(true);
  };
  const handleConfirmDelete = async () => {
    if (deleteTx) {
      await deleteTransaction(deleteTx.id);
    }
    setShowModal(false);
  };

  // UseCallback for handleRowClick to satisfy useMemo dependency
  const handleView = React.useCallback((row: Record<string, unknown>) => {
    if (onRowClick) {
      onRowClick(row as Transaction);
    }
  }, [onRowClick]);

  // Memoize columns for performance, include handleRowClick in deps
  const columns = React.useMemo(() => [
    {
      key: 'createdAt',
      label: 'Date',
      sortBy: true,
      render: (row: Transaction) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: 'type',
      label: 'Type',
      sortBy: true,
      render: (row: Transaction) => String(row.type),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortBy: true,
      render: (row: Transaction) => String(row.formattedAmount ?? row.amount),
    },
    {
      key: 'status',
      label: 'Status',
      sortBy: true,
      render: (row: Transaction) => String(row.status),
    },
    {
      key: 'method',
      label: 'Method',
      sortBy: true,
      render: (row: Transaction) => String(row.method),
    },
    // Actions column: show View for isAdmin or isSuperAdmin, Delete only for isSuperAdmin
    ...((UserPermission.isAdmin(currentUser?.role))
      ? [
          {
            key: 'actions',
            label: 'Actions',
            sortBy: false,
            render: (row: Record<string, unknown>) => (
              <>
                <Button
                  variant="info"
                  size="sm"
                  className={isSuperAdmin ? "me-2" : undefined}
                  onClick={e => {
                    e.stopPropagation();
                    handleView(row);
                  }}
                >
                  View
                </Button>
                {isSuperAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteClick(row);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </>
            ),
          },
        ]
      : []),
  ], [isSuperAdmin, currentUser, handleView]);

  // Use the original transactions array as data
  const tableData = transactions || [];

  return (
    <>
      <CATable
        columns={columns}
        data={tableData}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        onRowClick={handleView as (row: Record<string, unknown>) => void}
      />
      <CAModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Delete Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Confirm
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
        {deleteTx && (
          <div className="mt-2"><strong>ID:</strong> {deleteTx.id}</div>
        )}
      </CAModal>
    </>
  );
};

export default TransactionTable;
