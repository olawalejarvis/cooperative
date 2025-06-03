import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import { useUserStore } from '../store/user';
import { useTransactionStore } from '../store/transaction';
import { useSortState } from '../hooks/useSortState';
import OrganizationHomePage from './OrganizationHomePage';
import { withAuth } from '../components/withAuth';

export function OrganizationHomeContainer() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const { organization } = useOrganizationStore();
  const { user, } = useAuthStore();
  const { aggregate, loading: userAggLoading, error: userAggError, fetchUserAggregate } = useUserStore();
  const { transactions, loading: txLoading, error: txError, fetchMyTransactions } = useTransactionStore();
  const { sortBy, sortOrder, handleSortChange } = useSortState('createdAt', 'desc');

  useEffect(() => {
    if (user?.id) {
      fetchUserAggregate(user.id)
    }
  }, [user?.id, fetchUserAggregate]);

  useEffect(() => {
    if (user?.id) {
      fetchMyTransactions({ sortBy, sortOrder });
    }
  }, [user?.id, fetchMyTransactions, sortBy, sortOrder]);


  return (
    <OrganizationHomePage
      organization={organization}
      organizationName={organizationName}
      user={user}
      aggregate={aggregate}
      userAggLoading={userAggLoading}
      userAggError={userAggError}
      transactions={transactions}
      txLoading={txLoading}
      txError={txError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      handleSortChange={handleSortChange}
    />
  );
}

export const AuthOrganizationHome = withAuth(OrganizationHomeContainer);

// export default withAuth(OrganizationHomeContainer);