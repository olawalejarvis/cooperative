import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import type { Transaction } from '../store/transaction';
import type { UserAggregate } from '../store/user';
import type { SortOrder } from '../types';
import type { Organization } from '../store/organization';
import type { User } from '../store/auth';
import { useNavigate, useParams } from 'react-router-dom';

function UserDashboard({ userAggLoading, userAggError, aggregate, transactions, txLoading, txError, sortBy, sortOrder, handleSortChange }: {
  userAggLoading: boolean,
  userAggError: string | null | undefined,
  aggregate: UserAggregate | null,
  transactions: Transaction[],
  txLoading: boolean,
  txError: string | null | undefined,
  sortBy: string,
  sortOrder: SortOrder,
  handleSortChange: (field: string, order: SortOrder) => void
}) {
  const MAX_HOME_TRANSACTIONS = 7;
  const navigate = useNavigate();
  const { orgName } = useParams();
  const showTransactions = transactions.slice(0, MAX_HOME_TRANSACTIONS);
  return (
    <div className="mb-3">
      {/* Redesigned Account Balance Card */}
      <div className="d-flex align-items-center justify-content-between p-3 mb-3" style={{ background: 'linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)', borderRadius: 16, boxShadow: '0 2px 12px rgba(80,120,200,0.07)', minHeight: 80 }}>
        <div className="d-flex align-items-center">
          <div style={{ background: '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 18, boxShadow: '0 2px 8px rgba(80,120,200,0.10)' }}>
            <svg width="28" height="28" fill="#3b82f6" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm.5-9.5a.5.5 0 0 0-1 0V6H6a.5.5 0 0 0 0 1h1.5v2H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V10H10a.5.5 0 0 0 0-1H8.5V7H10a.5.5 0 0 0 0-1H8.5V4.5Z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', color: '#555', fontWeight: 500 }}>Account Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#222', letterSpacing: '-1px' }}>{aggregate ? aggregate.formattedAggregate : (userAggLoading ? <Spinner animation="border" size="sm" /> : '--')}</div>
          </div>
        </div>
        {userAggError && <Alert variant="warning" className="mb-0 py-1 px-2" style={{ fontSize: '0.95rem' }}>{userAggError}</Alert>}
      </div>
      <h5 className="mt-4">My Transactions</h5>
      <div className="text-muted mb-2" style={{ fontSize: '0.98rem' }}>
        Showing only your last {MAX_HOME_TRANSACTIONS} transactions
      </div>
      <TransactionTable
        transactions={showTransactions}
        loading={txLoading}
        error={txError}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      {transactions.length > MAX_HOME_TRANSACTIONS && (
        <div className="d-flex justify-content-end mt-2">
          <Button
            variant="outline-primary"
            className="view-all-link px-3 py-1 d-flex align-items-center"
            style={{ fontWeight: 500, fontSize: '1rem', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate(`/${orgName}/transactions`)}
          >
            <span className="me-2">View All Transactions</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a.75.75 0 0 1 .75-.75h10.19l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H1.75A.75.75 0 0 1 1 8Z"/>
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}

interface OrganizationHomePageProps {
  organization?: Organization | null;
  organizationName?: string;
  user?: User | null;
  aggregate: UserAggregate | null;
  userAggLoading: boolean;
  userAggError: string | null | undefined;
  transactions: Transaction[];
  txLoading: boolean;
  txError: string | null | undefined;
  sortBy: string;
  sortOrder: SortOrder;
  handleSortChange: (field: string, order: SortOrder) => void;
}

export default function OrganizationHomePage(props: OrganizationHomePageProps) {
  const {
    organization,
    user,
    aggregate,
    userAggLoading,
    userAggError,
    transactions,
    txLoading,
    txError,
    sortBy,
    sortOrder,
    handleSortChange,
  } = props;

  return (
    <>
      <Container className="mt-5">
        {/* User dashboard for logged-in users */}
        {user && (
          <UserDashboard
            userAggLoading={userAggLoading}
            userAggError={userAggError}
            aggregate={aggregate}
            transactions={transactions}
            txLoading={txLoading}
            txError={txError}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
          />
        )}
      </Container>
    </>
  );
}
