import { create } from 'zustand';
import { axiosInstance as axios } from '../api/axios';
import type { Organization } from './organization';

// Define the User type with all necessary fields
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  userName?: string;
  phoneNumber?: string;
  isActive: boolean;
  deleted: boolean;
  role: UserRole;
  organization?: Organization;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: User;
  updatedBy?: User;
  lastLogin?: string;
};

export const UserRole = {
  ROOT_USER: 'root_user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  USER: 'user',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];


export interface UserSearchParams {
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserPage {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


interface UserState {
  loading: boolean;
  error: string | null;
  orgUsers: User[];
  allUsers: User[];
  fetchOrgUsers: (orgName: string, params: UserSearchParams) => Promise<void>;
  fetchAllUsers: (params: UserSearchParams) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  loading: false,
  error: null,
  orgUsers: [],
  allUsers: [],
  fetchOrgUsers: async (orgName, params) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/organizations/${orgName}/users`, { params });
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
  fetchAllUsers: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/users`, { params });
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
  }
}));
