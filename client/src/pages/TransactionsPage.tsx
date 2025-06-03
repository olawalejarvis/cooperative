import { useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import type { Transaction } from '../store/transaction';
import type { User } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';
import type { SortOrder } from '../types';
import './TransactionsPage.css';
import { TRANSACTION_METHODS, TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../types/transactionFilters';
import { useTransactionStore } from '../store/transaction';

interface TransactionsPageProps {
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
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Handler to trigger parent filter (if needed)
  const handleAdvancedFilter = async () => {
    const filterOptions: Record<string, string | number | undefined> = {
      sortBy,
      sortOrder,
      method: method || undefined,
      status: status || undefined,
      type: type || undefined,
      page: 1,
      limit: 20,
    };
    if (dateFrom) filterOptions.dateFrom = dateFrom;
    if (dateTo) filterOptions.dateTo = dateTo;

    if (filter === 'my') {
      await transactionStore.fetchMyTransactions(filterOptions);
    } else {
      await transactionStore.fetchAllTransactions(filterOptions);
    }
  };

  return (
    <>
      <Container className="mt-5">
        <div className="transactions-top-card shadow-sm rounded-4 p-4 mb-4 bg-white d-flex flex-column gap-3 position-relative">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h2 className="transactions-title mb-1">Transactions</h2>
              <div className="transactions-subtitle text-muted" style={{ fontSize: '1.04rem' }}>
                View and manage your recent account transactions
              </div>
            </div>
            <div style={{ position: 'relative', minWidth: 180, maxWidth: 220, flex: '1 1 180px' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }}>
                <svg width="18" height="18" fill="#2563eb" viewBox="0 0 16 16"><path d="M6 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm3-3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/></svg>
              </span>
              <select
                className="form-select rounded-pill ps-5 px-3 fw-semibold shadow-sm"
                style={{ paddingLeft: 40, fontSize: '1.08rem', color: '#2563eb', border: '2px solid #3b82f6', background: '#f6f8fa', minWidth: 180, maxWidth: 220, flex: '1 1 180px' }}
                value={filter}
                onChange={e => onFilterChange(e.target.value as 'my' | 'org')}
              >
                <option value="my">My Transactions</option>
                {canViewOrgTransactions && <option value="org">Org Transactions</option>}
              </select>
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
    </>
  );
}
