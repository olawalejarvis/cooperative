import { create } from 'zustand';
import { axiosInstance as axios } from '../api/axios';
import type { Organization } from './organization';
import { isAxiosError } from 'axios';
import type { User } from './user';
import type { TransactionMethods, TransactionStatuses, TransactionTypes } from '../types/transactionFilters';

export interface Transaction extends Record<string, unknown> {
  id: string;
  amount: number;
  formattedAmount?: string;
  type: string;
  status: string;
  method: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  createdBy?: User;
  updatedBy?: User;
  organization?: Organization;
  statusUpdatedBy?: User;
  referenceId?: string;
  externalTransactionId?: string;
  description?: string;
  receiptUrl?: string;
  deleted?: boolean;
}

export interface TransactionPage {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TransactionPageResult = {
  data?: TransactionPage;
  error?: string | null;
};


export interface TransactionSearchParams {
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  method?: TransactionMethods;
  status?: TransactionStatuses;
  type?: TransactionTypes;
  dateRange?: {
    from?: string;
    to?: string;
  };
  createdBeforeDate?: string;
  createdAfterDate?: string;
  userId?: string;
  organizationId?: string;
}

export interface TransactionAggregate {
  amount: number;
  count: number;
  formattedAggregate: string;
  aggregationType: string;
  transactionStatus?: string;
  transactionType?: string;
  transactionMethod?: string;
  deleted: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
  createdBeforeDate?: string;
  createdAfterDate?: string;
}

interface TransactionState {
  transactions: Transaction[];
  aggregate: TransactionAggregate | null;
  loading: boolean;
  error: string | null;
  fetchMyTransactionAggregate: (userId: string) => Promise<void>;
  fetchMyTransactions: (options?: TransactionSearchParams) => Promise<TransactionPageResult>;
  fetchAllTransactions: (options?: TransactionSearchParams) => Promise<TransactionPageResult>;
  updateTransactionStatus: (id: string, status: string) => Promise<{ error: string | null }>;
  deleteTransaction: (id: string) => Promise<{ error: string | null }>;
  createTransaction: (data: Partial<Transaction>) => Promise<{ error: string | null }>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  aggregate: null,
  loading: false,
  error: null,
  fetchMyTransactions: async (options): Promise<TransactionPageResult> => {
    set({ loading: true, error: null });
    try {
      const urlSearchParams = getTransactionUrlSearchParams(options);
      let url = '/v1/transactions/me';
      
      if (Array.from(urlSearchParams).length) {
        url += `?${urlSearchParams.toString()}`;
      }
      
      const res = await axios.get(url);
      set({ transactions: res.data.data, loading: false });
      return {
        data: { ...res.data, transactions: res.data.data },
        error: null
      }
    } catch (err) {
      set({ loading: false });
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } }, message?: string };
        set({ error: errorObj.response?.data?.error || errorObj.message || 'Unknown error', loading: false });
      } else if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
      return { error: 'Failed to fetch transactions' }; // Return empty page on error
    }
  },
  fetchMyTransactionAggregate: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/transactions/users/${userId}/aggregate`);
      set({ aggregate: res.data, loading: false });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } }, message?: string };
        set({ error: errorObj.response?.data?.error || errorObj.message || 'Unknown error', loading: false });
      } else if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
    }
  },
  fetchAllTransactions: async (options): Promise<TransactionPageResult> => {
    set({ loading: true, error: null });
    try {
      let url = '/v1/transactions';
      const params = getTransactionUrlSearchParams(options);

      if (Array.from(params).length) {
        url += `?${params.toString()}`;
      }
      
      const res = await axios.get(url);
      set({ transactions: res.data.data, loading: false });
      return {
        data: { ...res.data, transactions: res.data.data },
        error: null
      }
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } }, message?: string };
        set({ error: errorObj.response?.data?.error || errorObj.message || 'Unknown error', loading: false });
      } else if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
      return { error: 'Failed to fetch transactions' };
    }
  },
  updateTransactionStatus: async (id: string, status: string) => {
    try {
      await axios.put(`/v1/transactions/${id}`, { status });
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else if (err instanceof Error) {
        return { error: err.message || 'Failed to update transaction status' };
      } else {
        return { error: 'Failed to update transaction status' };
      }
    }
  },
  deleteTransaction: async (id: string) => {
    try {
      await axios.delete(`/v1/transactions/${id}`);
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      }
      else if (err instanceof Error) {
        return { error: err.message || 'Failed to delete transaction' };
      }
      return { error: 'Failed to delete transaction' };
    }
  },
  createTransaction: async (data: Partial<Transaction>) => {
    try {
      await axios.post('/v1/transactions', data);
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else if (err instanceof Error) {
        return { error: err.message || 'Failed to create transaction' };
      }
      return { error: 'Failed to create transaction' };
    }
  },
}));

export function getTransactionUrlSearchParams(options: TransactionSearchParams | undefined): URLSearchParams {
  const params = new URLSearchParams();
  if (!options) return params;
  if (options.q) params.append('q', options.q);
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);
  if (options.page !== undefined) params.append('page', String(options.page));
  if (options.limit !== undefined) params.append('limit', String(options.limit));
  return params;
}

