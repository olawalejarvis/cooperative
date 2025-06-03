import { Container, Spinner, Alert } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import type { Transaction } from '../store/transaction';
import type { UserAggregate } from '../store/user';
import type { SortOrder } from '../types';
import type { Organization } from '../store/organization';
import type { User } from '../store/auth';


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
  return (
    <div className="mb-3">
      {userAggLoading ? (
        <Spinner animation="border" size="sm" />
      ) : userAggError ? (
        <Alert variant="warning">{userAggError}</Alert>
      ) : aggregate ? (
        <Alert variant="info">
          <strong>Account Balance:</strong> {aggregate.formattedAggregate}
        </Alert>
      ) : null}
      <h5 className="mt-4">My Transactions</h5>
      <TransactionTable
        transactions={transactions}
        loading={txLoading}
        error={txError}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
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
        <p>{organization?.description || 'No description available.'}</p>
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
