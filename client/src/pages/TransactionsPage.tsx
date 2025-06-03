import { Container, Dropdown, Spinner, Alert } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import type { Transaction } from '../store/transaction';
import type { User } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';
import type { SortOrder } from '../types';
import './TransactionsPage.css';

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

  return (
    <>
      <Container className="mt-5">
        <div className="transactions-top-card shadow-sm rounded-4 p-4 mb-4 bg-white d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 position-relative">
          <div>
            <h2 className="transactions-title mb-1">Transactions</h2>
            <div className="transactions-subtitle text-muted" style={{ fontSize: '1.04rem' }}>
              View and manage your recent account transactions
            </div>
          </div>
          <div className="transactions-filter-dropdown">
            <Dropdown onSelect={(val) => onFilterChange(val as 'my' | 'org')}>
              <Dropdown.Toggle variant="outline-primary" id="filter-dropdown" className="transactions-filter-toggle rounded-pill px-5 py-3 fw-semibold shadow-sm d-flex align-items-center gap-2" style={{ fontSize: '1.08rem', background: '#f6f8fa', color: '#2563eb', border: '2px solid #3b82f6', minWidth: 210 }}>
                <svg width="22" height="22" fill="#3b82f6" viewBox="0 0 16 16" className="me-2"><path d="M6 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm3-3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/></svg>
                {filter === 'my' ? 'My Transactions' : 'Org Transactions'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="transactions-dropdown-menu">
                <Dropdown.Item eventKey="my" className={filter === 'my' ? 'active' : ''}>My Transactions</Dropdown.Item>
                {canViewOrgTransactions && <Dropdown.Item eventKey="all" className={filter === 'org' ? 'active' : ''}>Org Transactions</Dropdown.Item>}
              </Dropdown.Menu>
            </Dropdown>
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
