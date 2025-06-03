import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import { useTransactionStore } from '../store/transaction';
import { useSortState } from '../hooks/useSortState';
import TransactionsPage from './TransactionsPage';
import TransactionModal from '../components/TransactionModal';
import type { Transaction } from '../store/transaction';

export function TransactionsContainer() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const navigate = useNavigate();
  const { organization, fetchOrganization } = useOrganizationStore();
  const { user, setUser, updateProfile, logout } = useAuthStore();
  const { transactions, loading, error, fetchMyTransactions, fetchAllTransactions } = useTransactionStore();
  const { sortBy, sortOrder, handleSortChange } = useSortState('createdAt', 'desc');
  const [filter, setFilter] = useState<'my' | 'org'>('my');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (organizationName) {
      fetchOrganization(organizationName);
    }
  }, [organizationName, fetchOrganization]);

  useEffect(() => {
    if (user && organization) {
      if (filter === 'my') {
        fetchMyTransactions({ sortBy, sortOrder });
      } else {
        fetchAllTransactions({ sortBy, sortOrder });
      }
    }
  }, [user, organization, filter, fetchMyTransactions, fetchAllTransactions, sortBy, sortOrder]);

  // AppNavBar handlers
  const handleLogout = () => {
    logout(organizationName);
    navigate('/');
  };
  const handleProfileUpdate = async (firstName: string, lastName: string) => {
    await updateProfile(organizationName, user?.id, firstName, lastName, setUser);
  };
  const handleOrganizationUpdate = async (label: string) => {
    if (!organization) return;
    await useOrganizationStore.getState().updateOrganization(organization.name, label);
  };
  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  const handleModalHide = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };
  const handleUpdateStatus = async (id: string, status: string) => {
    // Call update transaction API here (to be implemented in store next)
    await useTransactionStore.getState().updateTransactionStatus(id, status);
    setShowModal(false);
  };

  if (!organization || !user) return null;
  if (!user) return <Navigate to={`/${organizationName}`} replace />;

  return (
    <>
      <TransactionsPage
        organization={organization}
        user={user}
        transactions={transactions}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        filter={filter}
        onFilterChange={setFilter}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
        onOrganizationUpdate={handleOrganizationUpdate}
        onRowClick={handleRowClick}
      />
      <TransactionModal
        show={showModal}
        onHide={handleModalHide}
        transaction={selectedTransaction}
        userRole={user.role}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
