import { create } from 'zustand';
import axios from '../api/axios';

export interface Transaction extends Record<string, unknown> {
  id: string;
  amount: number;
  formattedAmount?: string;
  type: string;
  status: string;
  method: string;
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

export interface TransactionPage {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchMyTransactions: (options?: { sortBy?: string; sortOrder?: 'asc' | 'desc'; limit?: number; page?: number }) => Promise<TransactionPage | undefined>;
  fetchAllTransactions: (options?: { sortBy?: string; sortOrder?: 'asc' | 'desc'; limit?: number; page?: number }) => Promise<TransactionPage | undefined>;
  updateTransactionStatus: (id: string, status: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,
  fetchMyTransactions: async (options): Promise<TransactionPage | undefined> => {
    set({ loading: true, error: null });
    try {
      let url = '/v1/transactions/me';
      const params = new URLSearchParams();
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.page) params.append('page', String(options.page));
      if (Array.from(params).length) url += `?${params.toString()}`;
      const res = await axios.get(url);
      set({ transactions: res.data.data, loading: false });
      return res.data; // Return full response for pagination
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } }, message?: string };
        set({ error: errorObj.response?.data?.error || errorObj.message || 'Unknown error', loading: false });
      } else if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
      return undefined;
    }
  },
  fetchAllTransactions: async (options): Promise<TransactionPage | undefined> => {
    set({ loading: true, error: null });
    try {
      let url = '/v1/transactions';
      const params = new URLSearchParams();
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.page) params.append('page', String(options.page));
      if (Array.from(params).length) url += `?${params.toString()}`;
      const res = await axios.get(url);
      set({ transactions: res.data.data, loading: false });
      return res.data; // Return full response for pagination
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } }, message?: string };
        set({ error: errorObj.response?.data?.error || errorObj.message || 'Unknown error', loading: false });
      } else if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
      return undefined;
    }
  },
  updateTransactionStatus: async (id: string, status: string) => {
    await axios.put(`/v1/transactions/${id}`, { status });
    // Optionally, refetch or update the transaction in state
  },
  deleteTransaction: async (id: string) => {
    await axios.delete(`/v1/transactions/${id}`);
    // Optionally, refetch or update the transactions in state
  },
  createTransaction: async (data: Partial<Transaction>) => {
    await axios.post('/v1/transactions', data);
    // Optionally, refetch or update the transactions in state
  },
}));
