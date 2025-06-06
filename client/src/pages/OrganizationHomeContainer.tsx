import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useTransactionStore } from '../store/transaction';
import { useSortState } from '../hooks/useSortState';
import OrganizationHomePage from './OrganizationHomePage';
import { withAuth } from '../components/withAuth';

export function OrganizationHomeContainer() {
  const { user, } = useAuthStore();
  const { transactions, aggregate, loading: txLoading, error: txError, fetchMyTransactions, fetchMyTransactionAggregate } = useTransactionStore();
  const { sortBy, sortOrder, handleSortChange } = useSortState('createdAt', 'desc');

  useEffect(() => {
    if (user?.id) {
      fetchMyTransactionAggregate(user.id)
    }
  }, [user?.id, fetchMyTransactionAggregate]);

  useEffect(() => {
    if (user?.id) {
      fetchMyTransactions({ sortBy, sortOrder });
    }
  }, [user?.id, fetchMyTransactions, sortBy, sortOrder]);


  return (
    <OrganizationHomePage
      user={user}
      aggregate={aggregate}
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