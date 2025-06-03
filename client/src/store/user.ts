import { create } from 'zustand';
import axios from '../api/axios';
import type { User } from './organization';

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
  orgUsers: User[];
  allUsers: User[];
  fetchOrgUsers: (orgName: string, sortBy: string, sortOrder: 'asc' | 'desc') => Promise<void>;
  fetchAllUsers: (sortBy: string, sortOrder: 'asc' | 'desc') => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  aggregate: null,
  loading: false,
  error: null,
  orgUsers: [],
  allUsers: [],
  fetchUserAggregate: async (userId: string) => {
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
  fetchOrgUsers: async (orgName, sortBy, sortOrder) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/organizations/${orgName}/users`, { params: { sortBy, sortOrder } });
      set({ orgUsers: res.data.data, loading: false });
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
  fetchAllUsers: async (sortBy, sortOrder) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/users`, { params: { sortBy, sortOrder } });
      set({ allUsers: res.data.data, loading: false });
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