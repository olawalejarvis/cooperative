import { Container } from 'react-bootstrap';
import type { Transaction, TransactionAggregate } from '../store/transaction';
import type { SortOrder } from '../types';
import UserDashboard from '../components/UserDashboard';
import type { User } from '../store/user';

interface OrganizationHomePageProps {
  user?: User | null;
  aggregate: TransactionAggregate | null;
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
