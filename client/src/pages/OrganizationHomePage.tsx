import { Container } from 'react-bootstrap';
import type { Transaction } from '../store/transaction';
import type { UserAggregate } from '../store/user';
import type { SortOrder } from '../types';
import type { User } from '../store/auth';
import UserDashboard from '../components/UserDashboard';

interface OrganizationHomePageProps {
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
      <Container className="mt-4 px-1 px-sm-2 px-md-4" style={{ maxWidth: 900 }}>
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
