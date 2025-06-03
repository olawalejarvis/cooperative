import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useTransactionStore } from '../store/transaction';
import { useSortState } from '../hooks/useSortState';
import TransactionsPage from './TransactionsPage';
import TransactionModal from '../components/TransactionModal';
import type { Transaction } from '../store/transaction';
import { withAuth } from '../components/withAuth';

export function TransactionsContainer() {
  const { user } = useAuthStore();
  const { transactions, loading, error, fetchMyTransactions, fetchAllTransactions } = useTransactionStore();
  const { sortBy, sortOrder, handleSortChange } = useSortState('createdAt', 'desc');
  const [filter, setFilter] = useState<'my' | 'org'>('my');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (filter === 'my') {
      fetchMyTransactions({ sortBy, sortOrder });
    } else {
      fetchAllTransactions({ sortBy, sortOrder });
    }
  }, [filter, fetchMyTransactions, fetchAllTransactions, sortBy, sortOrder]);

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

  return (
    <>
      <TransactionsPage
        user={user}
        transactions={transactions}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        filter={filter}
        onFilterChange={setFilter}
        onRowClick={handleRowClick}
      />
      <TransactionModal
        show={showModal}
        onHide={handleModalHide}
        transaction={selectedTransaction}
        userRole={user?.role}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}

export const AuthTransactionsContainer = withAuth(TransactionsContainer);
