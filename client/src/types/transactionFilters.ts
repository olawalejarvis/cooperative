// Transaction filter options for use in TransactionsPage
export const TRANSACTION_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'paystack', label: 'Paystack' },
];

export const TRANSACTION_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const TRANSACTION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'savings_deposit', label: 'Savings Deposit' },
  { value: 'dividend_payment', label: 'Dividend Payment' },
];
