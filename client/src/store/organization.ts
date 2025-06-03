import { create } from 'zustand';
import axios from '../api/axios';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  userName?: string;
  isActive: boolean;
  deleted: boolean;
  role: string;
}

export interface Organization {
  id: string;
  name: string;
  label: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

interface RegisterUserInput {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  orgName?: string;
}

interface OrganizationState {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  setOrganization: (org: Organization) => void;
  fetchOrganization: (organizationName: string) => Promise<void>;
  clearOrganization: () => void;
  registerUser: (input: RegisterUserInput) => Promise<void>;
  updateOrganization: (organizationName: string, label: string, name?: string, description?: string) => Promise<void>;
  deleteUser: (orgName: string, userId: string) => Promise<void>;
  setUserActive: (orgName: string, userId: string, isActive: boolean) => Promise<void>;
  fetchOrganizations: (params: { q?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }) => Promise<Organization[]>;
  deactivateOrganization: (organizationName: string) => Promise<void>;
  deleteOrganization: (organizationName: string) => Promise<void>;
  createOrganization: (data: Partial<Organization>) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organization: null,
  loading: false,
  error: null,
  setOrganization: (org) => set({ organization: org }),
  clearOrganization: () => set({ organization: null, error: null }),
  fetchOrganization: async (organizationName: string) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/organizations/${organizationName}`);
      set({ organization: res.data.organization, loading: false });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        set({ error: err.response?.data?.error || err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
    }
  },
  registerUser: async (input) => {
    const { orgName, ...userData } = input;
    const url = orgName
      ? `/v1/organizations/${orgName}/users/register`
      : '/v1/users/register';
    await axios.post(url, userData);
  },
  updateOrganization: async (
    organizationName: string,
    label: string,
    name?: string,
    description?: string
  ) => {
    try {
      await axios.put(`/v1/organizations/${organizationName}`, { label, name, description });
      // Optionally update organization in parent/global state if needed
    } catch (err) {
      throw err;
    }
  },
  deleteUser: async (orgName: string, userId: string) => {
    await axios.delete(`/v1/organizations/${orgName}/users/${userId}`);
  },
  setUserActive: async (orgName: string, userId: string, isActive: boolean) => {
    await axios.patch(`/v1/organizations/${orgName}/users/${userId}/status`, { isActive });
  },
  fetchOrganizations: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/v1/organizations', { params });
      set({ loading: false });
      return res.data.data || [];
    } catch (err) {
      if (axios.isAxiosError(err)) {
        set({ error: err.response?.data?.error || err.message, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
      return [];
    }
  },
  deactivateOrganization: async (organizationName: string) => {
    await axios.patch(`/v1/organizations/${organizationName}`, { isActive: false });
  },
  deleteOrganization: async (organizationName: string) => {
    await axios.delete(`/v1/organizations/${organizationName}`);
  },
  createOrganization: async (data: Partial<Organization>) => {
    await axios.post('/v1/organizations', data);
    // Optionally, refetch or update the organizations in state
  },
}));
