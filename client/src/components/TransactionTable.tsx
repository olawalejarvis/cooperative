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
  onEndReached?: () => void;
  loadingMore?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading, error, sortBy, sortOrder, onSortChange, onRowClick, onEndReached, loadingMore }) => {
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
      render: (row: Transaction) => {
        // Map transaction type to icon and tooltip
        switch (row.type) {
          case 'savings_deposit':
            return (
              <span title="Savings Deposit" style={{ color: '#22c55e', fontSize: 18, display: 'inline-flex', alignItems: 'center' }}>
                <i className="bi bi-piggy-bank-fill" style={{ fontSize: 18, verticalAlign: 'middle' }} />
              </span>
            );
          case 'dividend_payment':
            return (
              <span title="Dividend Payment" style={{ color: '#f59e42', fontSize: 18, display: 'inline-flex', alignItems: 'center' }}>
                <i className="bi bi-cash-coin" style={{ fontSize: 18, verticalAlign: 'middle' }} />
              </span>
            );
          default:
            return (
              <span title={String(row.type)} style={{ color: '#64748b', fontSize: 18, display: 'inline-flex', alignItems: 'center' }}>
                <i className="bi bi-question-circle" style={{ fontSize: 18, verticalAlign: 'middle' }} />
              </span>
            );
        }
      },
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
              <div className="d-flex gap-2 align-items-center">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className={isSuperAdmin ? "catable-action-btn" : "catable-action-btn"}
                  style={{ borderRadius: 20, fontWeight: 500, fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(80,120,200,0.07)' }}
                  onClick={e => {
                    e.stopPropagation();
                    handleView(row);
                  }}
                >
                  <svg width="16" height="16" fill="#3b82f6" viewBox="0 0 16 16" className="me-1"><path d="M8 3.5c-3.5 0-6 3.5-6 4.5s2.5 4.5 6 4.5 6-3.5 6-4.5-2.5-4.5-6-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
                  View
                </Button>
                {isSuperAdmin && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="catable-action-btn"
                    style={{ borderRadius: 20, fontWeight: 500, fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(200,80,80,0.07)' }}
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteClick(row);
                    }}
                  >
                    <svg width="16" height="16" fill="#ef4444" viewBox="0 0 16 16" className="me-1"><path d="M6.5 1.5A1.5 1.5 0 0 1 8 0a1.5 1.5 0 0 1 1.5 1.5V2H14a1 1 0 0 1 0 2h-1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H2a1 1 0 0 1 0-2h4.5v-.5zm1 0V2h-1v-.5a.5.5 0 0 1 1 0zM5 4v9h6V4H5z"/></svg>
                    Delete
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ], [isSuperAdmin, currentUser, handleView]);

  // Use the original transactions array as data
  const tableData = transactions || [];

  return (
    <>
      <div className="table-responsive" style={{ minWidth: 0 }}>
        <CATable
          columns={columns}
          data={tableData}
          loading={loading}
          error={error}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSort}
          onRowClick={handleView as (row: Record<string, unknown>) => void}
          onEndReached={onEndReached}
        />
      </div>
      {loadingMore && <div style={{ textAlign: 'center', margin: '1rem' }}><span className="spinner-border spinner-border-sm" /></div>}
      <CAModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Delete Transaction"
        bodyClassName="transaction-modal-body"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="rounded-pill px-4" onClick={handleConfirmDelete}>
              Confirm
            </Button>
          </div>
        }
      >
        <div className="transaction-modal-content text-center">
          <div className="mb-3">
            <svg width="38" height="38" fill="#f59e42" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fef3c7"/><path d="M8 8l8 8M16 8l-8 8" stroke="#f59e42" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
          </div>
          <h5 className="mb-2" style={{ color: '#f59e42', fontWeight: 700 }}>Are you sure you want to delete this transaction?</h5>
          <div className="mb-3 text-muted">This action cannot be undone.</div>
          {deleteTx && (
            <div className="mt-2"><strong>ID:</strong> {deleteTx.id}</div>
          )}
        </div>
      </CAModal>
    </>
  );
};

export default TransactionTable;
