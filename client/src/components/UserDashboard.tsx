import { Button } from 'react-bootstrap';
import TransactionTable from '../components/TransactionTable';
import DashboardSummary from '../components/DashboardSummary';
import TransactionModal from '../components/TransactionModal';
import type { Transaction } from '../store/transaction';
import type { UserAggregate } from '../store/user';
import type { SortOrder } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { useTransactionStore } from '../store/transaction';

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
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const { organizationName } = useParams();
  const navigate = useNavigate();
  const transactionStore = useTransactionStore();
  const showTransactions = transactions.slice(0, MAX_HOME_TRANSACTIONS);

  const handleViewTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowModal(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await transactionStore.updateTransactionStatus(id, status);
    setShowModal(false);
  };

  // --- Dashboard Calculations ---
  // Filter transactions for year-to-date
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const ytdTx = transactions.filter(tx => new Date(tx.createdAt) >= startOfYear);
  const depositTx = ytdTx.filter(tx => tx.type === 'SAVING_DEPOSIT');
  const avgDeposit = depositTx.length
    ? depositTx.reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount)), 0) / depositTx.length
    : 0;
  const totalTxCount = ytdTx.length;
  const withdrawalTx = ytdTx.filter(tx => tx.type === 'WITHDRAWAL');
  const totalWithdrawals = withdrawalTx.length;
  const totalDeposits = depositTx.length;

  // Chart data: group by month for year-to-date
  const chartData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i <= now.getMonth(); i++) {
    const d = new Date(now.getFullYear(), i, 1);
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const monthTx = ytdTx.filter(tx => {
      const txDate = new Date(tx.createdAt);
      return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
    });
    const deposits = monthTx.filter(tx => tx.type === 'SAVING_DEPOSIT').reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount)), 0);
    const withdrawals = monthTx.filter(tx => tx.type === 'WITHDRAWAL').reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount)), 0);
    chartData.push({ month: `${month} ${year}`, Deposits: deposits, Withdrawals: withdrawals });
  }

  return (
    <div className="mb-3" style={{ minWidth: 0 }}>
      <DashboardSummary
        aggregate={aggregate}
        userAggLoading={userAggLoading}
        userAggError={userAggError}
        avgDeposit={avgDeposit}
        totalDeposits={totalDeposits}
        totalTxCount={totalTxCount}
        totalWithdrawals={totalWithdrawals}
        chartData={chartData}
        isYearToDate={true}
      />
      <div className="text-muted mb-2" style={{ fontSize: '0.98rem' }}>
        Last {MAX_HOME_TRANSACTIONS} transactions history
      </div>
      <div className="w-100 overflow-auto" style={{ minWidth: 0 }}>
        <TransactionTable
          transactions={showTransactions}
          loading={txLoading}
          error={txError}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onRowClick={handleViewTransaction}
        />
      </div>
      {transactions.length > MAX_HOME_TRANSACTIONS && (
        <div className="d-flex justify-content-end mt-2">
          <Button
            variant="outline-primary"
            className="view-all-link px-3 py-1 d-flex align-items-center"
            style={{ fontWeight: 500, fontSize: '1rem', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => navigate(`/${organizationName}/transactions`)}
          >
            <span className="me-2">View Transactions History</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a.75.75 0 0 1 .75-.75h10.19l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H1.75A.75.75 0 0 1 1 8Z"/>
            </svg>
          </Button>
        </div>
      )}
      <TransactionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        transaction={selectedTx}
        userRole={"admin"}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default UserDashboard;
