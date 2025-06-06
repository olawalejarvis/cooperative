// Transaction filter options for use in TransactionsPage
export const TRANSACTION_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'paystack', label: 'Paystack' },
];


export type TransactionMethods = typeof TRANSACTION_METHODS[keyof typeof TRANSACTION_METHODS];
export type TransactionStatuses = typeof TRANSACTION_STATUSES[keyof typeof TRANSACTION_STATUSES];
export type TransactionTypes = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

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
