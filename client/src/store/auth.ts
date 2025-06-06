import { create } from 'zustand';
import { axiosInstance as axios, isAxiosError } from '../api/axios';
import type { User } from './user';

interface AuthState {
  user: User | null;
  loading: boolean;
  hasCheckedAuth: boolean;
  setUser: (user: User | null) => void;
  logout: (organizationName?: string) => void;
  login: (userName: string, password: string, organizationName?: string) => Promise<void>;
  getMe: (organizationName?: string) => Promise<void>;
  request2FACode: (username: string, password: string, organizationName: string) => Promise<{ error: string | null } | null>;
  verify2FACode: (username: string, code: string, organizationName: string) => Promise<{ error: string | null } | null>;
  updateProfile: (
    organizationName: string | undefined,
    userId: string | undefined,
    firstName: string,
    lastName: string,
    setUser: (user: User) => void
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hasCheckedAuth: false,
  setUser: (user) => set({ user }),
  logout: async (organizationName): Promise<void> => {
    set({ loading: true });
    try {
      const url = `/v1/organizations/${organizationName}/users/logout`;
      await axios.put(url);
    } finally {
      set({ user: null, loading: false, hasCheckedAuth: true });
    }
  },
  login: async (username, password, organizationName) => {
    set({ loading: true });
    try {
      const loginUrl = `/v1/organizations/${organizationName}/users/login`;
      const res = await axios.post(loginUrl, { username, password });
      set({ user: res.data.user, loading: false, hasCheckedAuth: true });
    } catch (err) {
      set({ user: null, loading: false, hasCheckedAuth: true });
      throw err;
    }
  },
  getMe: async (organizationName) => {
    set({ loading: true });
    try {
      const url = `/v1/organizations/${organizationName}/users/me`;
      const res = await axios.get(url);
      set({ user: res.data, loading: false, hasCheckedAuth: true });
    } catch {
      set({ user: null, loading: false, hasCheckedAuth: true });
    }
  },
  request2FACode: async (username, password, organizationName) => {
    try {
      await axios.post(`/v1/organizations/${organizationName}/users/login-2fa`, { username, password });
      return { error: null };
    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message || 'Invalid credentials' };
      }
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      }
      return { error: 'Invalid credentials' };
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
      return { error: null };
    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message || 'Invalid or expired code' };
      }
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      }
      return { error: 'Invalid or expired code' };
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
