import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import { useUserStore } from '../store/user';
import { useTransactionStore } from '../store/transaction';
import { useSortState } from '../hooks/useSortState';
import OrganizationHomePage from './OrganizationHomePage';

export function OrganizationHomeContainer() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const { organization, loading, error, fetchOrganization } = useOrganizationStore();
  const { user, loading: authLoading, getMe, setUser, updateProfile } = useAuthStore();
  const { aggregate, loading: userAggLoading, error: userAggError, fetchUserAggregate } = useUserStore();
  const { transactions, loading: txLoading, error: txError, fetchMyTransactions } = useTransactionStore();
  const [showRegister, setShowRegister] = useState(false);
  const { sortBy, sortOrder, handleSortChange } = useSortState('createdAt', 'desc');

  useEffect(() => {
    if (organizationName) {
      getMe(organizationName);
      fetchOrganization(organizationName);
    }
  }, [organizationName, fetchOrganization, getMe]);

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

  // Handlers for AppNavBar
  const handleLogout = () => {
    useAuthStore.getState().logout(organizationName);
  };
  const handleProfileUpdate = async (firstName: string, lastName: string) => {
    await updateProfile(organizationName, user?.id, firstName, lastName, setUser);
  };
  const handleOrganizationUpdate = async (label: string) => {
    if (!organization) return;
    await useOrganizationStore.getState().updateOrganization(organization.name, label);
  };

  return (
    <OrganizationHomePage
      organization={organization}
      organizationName={organizationName}
      loading={loading}
      error={error}
      user={user}
      authLoading={authLoading}
      showRegister={showRegister}
      setShowRegister={setShowRegister}
      aggregate={aggregate}
      userAggLoading={userAggLoading}
      userAggError={userAggError}
      transactions={transactions}
      txLoading={txLoading}
      txError={txError}
      sortBy={sortBy}
      sortOrder={sortOrder}
      handleSortChange={handleSortChange}
      onLogout={handleLogout}
      onProfileUpdate={handleProfileUpdate}
      onOrganizationUpdate={handleOrganizationUpdate}
    />
  );
}
