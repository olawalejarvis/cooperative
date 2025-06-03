import { Container, Dropdown, Spinner, Alert } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import type { Transaction } from '../store/transaction';
import type { User } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';
import type { SortOrder } from '../types';

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
        <h2>Transactions</h2>
        <div className="d-flex align-items-center mb-3">
          <Dropdown onSelect={(val) => onFilterChange(val as 'my' | 'org')}>
            <Dropdown.Toggle variant="secondary" id="filter-dropdown">
              {filter === 'my' ? 'My Transactions' : 'Org Transactions'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="my">My Transactions</Dropdown.Item>
              {canViewOrgTransactions && <Dropdown.Item eventKey="all">Org Transactions</Dropdown.Item>}
            </Dropdown.Menu>
          </Dropdown>
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
          />
        )}
      </Container>
    </>
  );
}
