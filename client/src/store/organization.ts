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
}));
