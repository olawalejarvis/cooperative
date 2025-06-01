import { create } from 'zustand';
import axios from '../api/axios';

// Define the User type to match the structure expected from the API
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  userName?: string;
  phoneNumber?: string;
  isActive: boolean;
  deleted: boolean;
  role: string; // e.g., 'ROOT_USER', 'ADMIN', etc.'
  organization?: string; // Organization ID or name
  createdAt?: string;
  updatedAt?: string;
  token?: string;
};

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: (organizationName?: string) => void;
  login: (userName: string, password: string, organizationName?: string) => Promise<void>;
  getMe: (organizationName?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  logout: async (organizationName): Promise<void> => {
    set({ loading: true });
    try {
      const url = organizationName ? `/v1/organizations/${organizationName}/users/logout` : '/v1/users/logout';
      await axios.put(url); // withCredentials is global
    } finally {
      set({ user: null, loading: false });
    }
  },
  // Login function that handles both organization-specific and global login
  login: async (username, password, organizationName) => {
    set({ loading: true });
    try {
      const loginUrl = organizationName ? `/v1/organizations/${organizationName}/users/login` : '/v1/users/login';
      const res = await axios.post(loginUrl, { username, password }); // withCredentials is now global
      set({ user: res.data.user, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
      throw err;
    }
  },
  getMe: async (organizationName) => {
    set({ loading: true });
    try {
      const url = organizationName ? `/v1/organizations/${organizationName}/users/me` : '/v1/users/me';
      const res = await axios.get(url);
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
