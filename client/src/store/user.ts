import { create } from 'zustand';
import axios from '../api/axios';

export interface UserAggregate {
  amount: number;
  count: number;
  formattedAggregate: string; // e.g., "₦1,234.56"
  aggregationType: string;
  transactionStatus?: string;
  transactionType?: string;
  transactionMethod?: string;
  deleted: boolean;
  dateRange?: {
    from?: string; // ISO date string
    to?: string; // ISO date string
  };
  createdBeforeDate?: string; // ISO date string
  createdAfterDate?: string; // ISO date string
}

interface UserState {
  aggregate: UserAggregate | null;
  loading: boolean;
  error: string | null;
  fetchUserAggregate: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  aggregate: null,
  loading: false,
  error: null,
  fetchUserAggregate: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/transactions/users/${userId}/aggregate`);
      console.log('Fetched user aggregate:', res.data);
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
}));