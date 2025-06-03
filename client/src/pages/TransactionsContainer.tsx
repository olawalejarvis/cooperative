import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { useTransactionStore } from '../store/transaction';
import { useSortState } from '../hooks/useSortState';
import TransactionsPage from './TransactionsPage';
import TransactionModal from '../components/TransactionModal';
import type { Transaction, TransactionPage } from '../store/transaction';
import { withAuth } from '../components/withAuth';

export function TransactionsContainer() {
  const { user } = useAuthStore();
  const { loading, error, fetchMyTransactions, fetchAllTransactions } = useTransactionStore();
  const { sortBy, sortOrder, handleSortChange } = useSortState('createdAt', 'desc');
  const [filter, setFilter] = useState<'my' | 'org'>('my');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const isInitialLoad = useRef(true);

  // Initial load or filter/sort change
  useEffect(() => {
    let ignore = false;
    async function load() {
      setPage(1);
      setAllTransactions([]);
      isInitialLoad.current = true;
      setLoadingMore(true);
      let result: TransactionPage | undefined;
      if (filter === 'my') {
        result = await fetchMyTransactions({ sortBy, sortOrder, limit: 20, page: 1 });
      } else {
        result = await fetchAllTransactions({ sortBy, sortOrder, limit: 20, page: 1 });
      }
      if (!ignore) {
        setAllTransactions(result?.data || []);
        setTotalPages(result?.totalPages || 1);
        setLoadingMore(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [filter, sortBy, sortOrder, fetchMyTransactions, fetchAllTransactions]);

  // Append new transactions when page increases
  useEffect(() => {
    if (page === 1 || isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    let ignore = false;
    async function loadMore() {
      setLoadingMore(true);
      let result: TransactionPage | undefined;
      if (filter === 'my') {
        result = await fetchMyTransactions({ sortBy, sortOrder, limit: 20, page });
      } else {
        result = await fetchAllTransactions({ sortBy, sortOrder, limit: 20, page });
      }
      if (!ignore) {
        setAllTransactions(prev => [...prev, ...(result?.data || [])]);
        setTotalPages(result?.totalPages || totalPages);
        setLoadingMore(false);
      }
    }
    loadMore();
    return () => { ignore = true; };
  }, [page, filter, sortBy, sortOrder, fetchMyTransactions, fetchAllTransactions, totalPages]);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  const handleModalHide = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };
  const handleUpdateStatus = async (id: string, status: string) => {
    await useTransactionStore.getState().updateTransactionStatus(id, status);
    setShowModal(false);
  };

  // Lazy scroll handler
  const onEndReached = useCallback(() => {
    if (!loadingMore && page < totalPages) {
      setPage(p => p + 1);
    }
  }, [loadingMore, page, totalPages]);

  return (
    <>
      <TransactionsPage
        user={user}
        transactions={allTransactions}
        loading={loading && page === 1}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        filter={filter}
        onFilterChange={setFilter}
        onRowClick={handleRowClick}
        onEndReached={onEndReached}
        loadingMore={loadingMore}
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
