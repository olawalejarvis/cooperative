import { useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import type { Transaction, TransactionSearchParams } from '../store/transaction';
import { UserPermission } from '../utils/UserPermission';
import type { SortOrder } from '../types';
import './TransactionsPage.css';
import { TRANSACTION_METHODS, TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../types/transactionFilters';
import { useTransactionStore } from '../store/transaction';
import { CAModal } from '../components/CAModal';
import type { User } from '../store/user';

export interface TransactionsPageProps {
  user: User | null | undefined;
  transactions: Transaction[];
  loading: boolean;
  error: string | null | undefined;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (field: string, order: SortOrder) => void;
  filter: 'my' | 'org';
  onFilterChange: (filter: 'my' | 'org') => void;
  onRowClick?: (transaction: Transaction) => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
}

export default function TransactionsPage(props: TransactionsPageProps) {
  const {
    user,
    transactions,
    loading,
    error,
    sortBy,
    sortOrder,
    onSortChange,
    filter,
    onFilterChange,
    onRowClick,
  } = props;

  const canViewOrgTransactions = UserPermission.isAdmin(user?.role);
  const transactionStore = useTransactionStore();

  // Add local filter state for method, status, type, and date range
  const [method, setMethod] = useState();
  const [status, setStatus] = useState();
  const [type, setType] = useState();
  const [dateFrom, setDateFrom] = useState();
  const [dateTo, setDateTo] = useState();

  // Handler to trigger parent filter (if needed)
  const handleAdvancedFilter = async () => {
    const filterOptions: TransactionSearchParams = {
      sortBy,
      sortOrder,
      method,
      status,
      type,
      page: 1,
      limit: 20,
    };
    if (dateFrom || dateTo) filterOptions.dateRange = {
      from: dateFrom || undefined,
      to: dateTo || undefined,
    };
    if (filter === 'my') {
      filterOptions.userId = user?.id;
    } else if (canViewOrgTransactions) {
      filterOptions.organizationId = user?.organization?.id;
    }

    if (filter === 'my') {
      await transactionStore.fetchMyTransactions(filterOptions);
    } else {
      await transactionStore.fetchAllTransactions(filterOptions);
    }
  };

  const [showCreateTransactionModal, setShowCreateTransactionModal] = useState(false);
  const [createTransactionForm, setCreateTransactionForm] = useState({
    amount: '',
    type: '',
    method: '',
    status: 'pending',
    createdAt: '',
  });
  const [createTransactionLoading, setCreateTransactionLoading] = useState(false);
  const [createTransactionError, setCreateTransactionError] = useState<string | null>(null);
  const isAdmin = UserPermission.isAdmin(user?.role);

  const handleCreateTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCreateTransactionForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleOpenCreateTransaction = () => {
    setCreateTransactionForm({ amount: '', type: '', method: '', status: 'pending', createdAt: '' });
    setCreateTransactionError(null);
    setShowCreateTransactionModal(true);
  };
  const handleCloseCreateTransaction = () => setShowCreateTransactionModal(false);

  const handleCreateTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTransactionLoading(true);
    setCreateTransactionError(null);
    try {
      if (!createTransactionForm.amount || !createTransactionForm.type || !createTransactionForm.method || !createTransactionForm.createdAt) {
        setCreateTransactionError('All fields except status are required.');
        setCreateTransactionLoading(false);
        return;
      }
      await transactionStore.createTransaction({
        amount: Number(createTransactionForm.amount),
        type: createTransactionForm.type,
        method: createTransactionForm.method,
        status: isAdmin ? createTransactionForm.status : 'pending',
        createdAt: createTransactionForm.createdAt,
      });
      setShowCreateTransactionModal(false);
      setCreateTransactionForm({ amount: '', type: '', method: '', status: 'pending', createdAt: '' });
      // Optionally, refresh the list
      handleAdvancedFilter();
    } catch (err: unknown) {
      if (err instanceof Error) setCreateTransactionError(err.message);
      else setCreateTransactionError('Failed to create transaction');
    } finally {
      setCreateTransactionLoading(false);
    }
  };

  return (
    <>
      <Container className="mt-5">
        <div className="transactions-top-card shadow-sm rounded-4 p-4 mb-4 bg-white d-flex flex-column gap-3 position-relative">
          <div className="row align-items-center g-3 flex-wrap">
            <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
              <h2 className="transactions-title mb-1">Transactions</h2>
              <div className="transactions-subtitle text-muted" style={{ fontSize: '1.04rem' }}>
                View and manage your recent account transactions
              </div>
            </div>
            <div className="col-12 col-md-6 d-flex flex-row flex-wrap justify-content-md-end align-items-center gap-2 mt-3 mt-md-0">
              <button
                className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm flex-shrink-0"
                type="button"
                style={{ fontSize: '1.05rem', background: '#3b82f6', border: 'none', minWidth: 180 }}
                onClick={handleOpenCreateTransaction}
              >
                + Create New Transaction
              </button>
              <div style={{ position: 'relative', minWidth: 180, maxWidth: 220, flex: '1 1 180px' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }}>
                  <svg width="18" height="18" fill="#2563eb" viewBox="0 0 16 16"><path d="M6 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm3-3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/></svg>
                </span>
                <select
                  className="form-select rounded-pill ps-5 px-3 fw-semibold shadow-sm"
                  style={{ paddingLeft: 40, fontSize: '1.08rem', color: '#2563eb', border: '2px solid #3b82f6', background: '#f6f8fa', minWidth: 180, maxWidth: 220 }}
                  value={filter}
                  onChange={e => onFilterChange(e.target.value as 'my' | 'org')}
                >
                  <option value="my">My Transactions</option>
                  {canViewOrgTransactions && <option value="org">Org Transactions</option>}
                </select>
              </div>
            </div>
          </div>
          {/* Responsive filter row */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mt-2" style={{ gap: 4 }}>
            <select className="form-select rounded-pill px-3 fw-semibold shadow-sm" style={{ minWidth: 150, flex: '1 1 180px', fontSize: '1.05rem' }} value={method} onChange={e => setMethod(e.target.value)}>
              {TRANSACTION_METHODS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select className="form-select rounded-pill px-3 fw-semibold shadow-sm" style={{ minWidth: 150, flex: '1 1 180px', fontSize: '1.05rem' }} value={status} onChange={e => setStatus(e.target.value)}>
              {TRANSACTION_STATUSES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select className="form-select rounded-pill px-3 fw-semibold shadow-sm" style={{ minWidth: 150, flex: '1 1 180px', fontSize: '1.05rem' }} value={type} onChange={e => setType(e.target.value)}>
              {TRANSACTION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="d-flex flex-column flex-md-row align-items-center" style={{flex: '2 1 320px', minWidth: 180}}>
              <label className="mb-0 me-2 fw-semibold text-muted" style={{fontSize: '1rem', whiteSpace: 'nowrap'}}>Date:</label>
              <input type="date" className="form-control rounded-pill px-3 fw-semibold shadow-sm" style={{ minWidth: 120, flex: '1 1 120px', fontSize: '1.05rem' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
              <span className="mx-1">-</span>
              <input type="date" className="form-control rounded-pill px-3 fw-semibold shadow-sm" style={{ minWidth: 120, flex: '1 1 120px', fontSize: '1.05rem' }} value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
            </div>
            <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold" type="button" style={{ flex: '0 0 auto', minWidth: 100, fontSize: '1.05rem' }} onClick={handleAdvancedFilter}>
              Filter
            </button>
          </div>
          <div className="transactions-top-divider position-absolute w-100 start-0" style={{ bottom: '-18px', left: 0 }} />
        </div>
        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <TransactionTable
            transactions={transactions}
            loading={loading}
            error={error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            onRowClick={onRowClick}
            onEndReached={props.onEndReached}
            loadingMore={props.loadingMore}
          />
        )}
      </Container>
      {/* Create Transaction Modal */}
      <CAModal show={showCreateTransactionModal} onHide={handleCloseCreateTransaction} title="Create New Transaction" size="lg">
        <form onSubmit={handleCreateTransactionSubmit} className="d-flex flex-column gap-3 p-2">
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label fw-semibold">Amount</label>
              <input type="number" name="amount" className="form-control rounded-pill px-3" min="0" step="0.01" value={createTransactionForm.amount} onChange={handleCreateTransactionChange} required />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label fw-semibold">Type</label>
              <select name="type" className="form-select rounded-pill px-3" value={createTransactionForm.type} onChange={handleCreateTransactionChange} required>
                <option value="" disabled>Select type</option>
                {TRANSACTION_TYPES.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label fw-semibold">Method</label>
              <select name="method" className="form-select rounded-pill px-3" value={createTransactionForm.method} onChange={handleCreateTransactionChange} required>
                <option value="" disabled>Select method</option>
                {TRANSACTION_METHODS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label fw-semibold">Date</label>
              <input type="date" name="createdAt" className="form-control rounded-pill px-3" value={createTransactionForm.createdAt} onChange={handleCreateTransactionChange} required />
            </div>
          </div>
          {isAdmin && (
            <div className="row">
              <div className="col-md-6 mb-2">
                <label className="form-label fw-semibold">Status</label>
                <select name="status" className="form-select rounded-pill px-3" value={createTransactionForm.status} onChange={handleCreateTransactionChange} required>
                  {TRANSACTION_STATUSES.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          )}
          {createTransactionError && <div className="text-danger fw-semibold">{createTransactionError}</div>}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={handleCloseCreateTransaction} disabled={createTransactionLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary rounded-pill px-4" style={{ background: '#3b82f6', border: 'none' }} disabled={createTransactionLoading}>
              {createTransactionLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </CAModal>
    </>
  );
}
