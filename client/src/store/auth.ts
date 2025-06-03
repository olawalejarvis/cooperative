import { create } from 'zustand';
import axios from '../api/axios';
import type { Organization } from './organization';

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
  organization?: Organization; // Organization ID or name
  createdAt?: string;
  updatedAt?: string;
  token?: string;
};

interface AuthState {
  user: User | null;
  loading: boolean;
  hasCheckedAuth: boolean;
  setUser: (user: User | null) => void;
  logout: (organizationName?: string) => void;
  login: (userName: string, password: string, organizationName?: string) => Promise<void>;
  getMe: (organizationName?: string) => Promise<void>;
  request2FACode: (username: string, password: string, organizationName: string) => Promise<string | null>;
  verify2FACode: (username: string, code: string, organizationName: string) => Promise<string | null>;
  updateProfile: (
    organizationName: string | undefined,
    userId: string | undefined,
    firstName: string,
    lastName: string,
    setUser: (user: User) => void
  ) => Promise<void>;
}

function isAxiosError(err: unknown): err is { response: { data?: { error?: string } } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as Record<string, unknown>).response === 'object'
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hasCheckedAuth: false,
  setUser: (user) => set({ user }),
  logout: async (organizationName): Promise<void> => {
    set({ loading: true });
    try {
      const url = organizationName ? `/v1/organizations/${organizationName}/users/logout` : '/v1/users/logout';
      await axios.put(url); // withCredentials is global
    } finally {
      set({ user: null, loading: false, hasCheckedAuth: true });
    }
  },
  // Login function that handles both organization-specific and global login
  login: async (username, password, organizationName) => {
    set({ loading: true });
    try {
      const loginUrl = organizationName ? `/v1/organizations/${organizationName}/users/login` : '/v1/users/login';
      const res = await axios.post(loginUrl, { username, password }); // withCredentials is now global
      set({ user: res.data.user, loading: false, hasCheckedAuth: true });
    } catch (err) {
      set({ user: null, loading: false, hasCheckedAuth: true });
      throw err;
    }
  },
  getMe: async (organizationName) => {
    set({ loading: true });
    try {
      const url = organizationName ? `/v1/organizations/${organizationName}/users/me` : '/v1/users/me';
      const res = await axios.get(url);
      set({ user: res.data, loading: false, hasCheckedAuth: true });
    } catch {
      set({ user: null, loading: false, hasCheckedAuth: true });
    }
  },
  request2FACode: async (username, password, organizationName) => {
    try {
      await axios.post(`/v1/organizations/${organizationName}/users/login-2fa`, { username, password });
      return null;
    } catch (err) {
      if (err instanceof Error) {
        return err.message || 'Invalid credentials';
      }
      if (isAxiosError(err) && err.response?.data?.error) {
        return err.response.data.error;
      }
      return 'Invalid credentials';
    }
  },
  /**
   * Verify the 2FA code for a user.
   * @param username 
   * @param code 
   * @param organizationName 
   */
  verify2FACode: async (username, code, organizationName) => {
    try {
      const res = await axios.post(`/v1/organizations/${organizationName}/users/login-2fa/verify`, { username, code });
      if (res.data && res.data.user) {
        set({ user: res.data.user, loading: false });
      }
      return null;
    } catch (err) {
      if (err instanceof Error) {
        return err.message || 'Invalid or expired code';
      }
      if (isAxiosError(err) && err.response?.data?.error) {
        return err.response.data.error;
      }
      return 'Invalid or expired code';
    }
  },
  updateProfile: async (
    organizationName: string | undefined,
    userId: string | undefined,
    firstName: string,
    lastName: string,
    setUser: (user: User) => void
  ) => {
    if (!organizationName || !userId) throw new Error('Missing organization or user ID');
    try {
      const res = await axios.put(
        `/v1/organizations/${organizationName}/users/${userId}`,
        { firstName, lastName }
      );
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Update failed');
    }
  },
}));
