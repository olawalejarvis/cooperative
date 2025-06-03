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

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchMyTransactions: (options?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }) => Promise<void>;
  fetchAllTransactions: (options?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }) => Promise<void>;
  updateTransactionStatus: (id: string, status: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,
  fetchMyTransactions: async (options) => {
    set({ loading: true, error: null });
    try {
      let url = '/v1/transactions/me';
      if (options?.sortBy && options?.sortOrder) {
        url += `?sortBy=${options.sortBy}&sortOrder=${options.sortOrder}`;
      }
      const res = await axios.get(url);
      set({ transactions: res.data.data, loading: false });
    } catch (err) {
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
  fetchAllTransactions: async (options) => {
    set({ loading: true, error: null });
    try {
      let url = '/v1/transactions';
      if (options?.sortBy && options?.sortOrder) {
        url += `?sortBy=${options.sortBy}&sortOrder=${options.sortOrder}`;
      }
      const res = await axios.get(url);
      set({ transactions: res.data.data, loading: false });
    } catch (err) {
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
  updateTransactionStatus: async (id: string, status: string) => {
    await axios.put(`/v1/transactions/${id}`, { status });
    // Optionally, refetch or update the transaction in state
  },
}));
