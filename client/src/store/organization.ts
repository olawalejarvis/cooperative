import { create } from 'zustand';
import { axiosInstance as axios, isAxiosError } from '../api/axios';
import { useAuthStore } from './auth';
import type { User } from './user';
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
  updatedBy?: User;
}

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface OrganizationState {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  setOrganization: (org: Organization) => void;
  fetchCurrentOrganization: (organizationName: string) => Promise<void>;
  fetchOrganizationByName: (organizationName: string) => Promise<Organization | { error: string }>;
  clearOrganization: () => void;
  registerOrganizationUser: (input: RegisterUserInput, orgName: string) => Promise<{ error: string | null } | void>;
  updateOrganization: (organizationName: string, label: string, name?: string, description?: string) => Promise<{ error: string | null } | void>;
  deleteOrganizationUser: (orgName: string, userId: string) => Promise<{ error: string | null } | void>;
  setOrganizationUserActive: (orgName: string, userId: string, isActive: boolean) => Promise<{ error: string | null } | void>;
  fetchOrganizations: (params: { q?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }) => Promise<Organization[]>;
  deactivateOrganization: (organizationName: string) => Promise<{ error: string | null } | void>;
  deleteOrganization: (organizationName: string) => Promise<{ error: string | null } | void>;
  createOrganization: (data: Partial<Organization>) => Promise<{ error: string | null } | void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organization: null,
  loading: false,
  error: null,
  setOrganization: (org) => set({ organization: org }),
  clearOrganization: () => set({ organization: null, error: null }),
  fetchCurrentOrganization: async (organizationName: string) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/v1/organizations/${organizationName}`);
      set({ organization: res.data.organization, loading: false });
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        set({ error: err.response?.data?.error, loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
    }
  },
  fetchOrganizationByName: async (organizationName: string) => {
    try {
      const res = await axios.get(`/v1/organizations/${organizationName}`);
      return res.data.organization;
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else {
        return { error: 'Unknown error occurred while fetching organization' };
      }
    }
  },
  registerOrganizationUser: async (input, orgName) => {
    const userData = input;
    const url = `/v1/organizations/${orgName}/users/register`;
    try {
      await axios.post(url, userData);
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else {
        return { error: 'Unknown error occurred while registering user' };
      }
    }
  },
  updateOrganization: async (
    organizationName: string,
    label?: string,
    name?: string,
    description?: string
  ) => {
    try {
      await axios.put(`/v1/organizations/${organizationName}`, { label, name, description });
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else {
        return { error: 'Unknown error occurred while updating organization' };
      }
    }
  },
  deleteOrganizationUser: async (orgName: string, userId: string) => {
    try {
      // Check if the user is trying to delete themselves
      const currentUserId = useAuthStore.getState().user?.id;
      if (currentUserId === userId) {
        return { error: 'You cannot delete yourself from the organization'};
      }
      await axios.delete(`/v1/organizations/${orgName}/users/${userId}`);
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else {
        return { error: 'Unknown error occurred while deleting user' };
      }
    }
  },
  setOrganizationUserActive: async (orgName: string, userId: string, isActive: boolean) => {
    try {
      // Check if the user is trying to deactivate themselves
      const currentUserId = useAuthStore.getState().user?.id;
      if (currentUserId === userId && !isActive) {
        return { error: 'You cannot deactivate yourself from the organization'};
      }
      const url = `/v1/organizations/${orgName}/users/${userId}`;
      await axios.patch(url, { isActive });
      return { error: null };
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      }
      else {
        return { error: 'Unknown error occurred while updating user status' };
      }
    }
  },
  fetchOrganizations: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/v1/organizations', { params });
      set({ loading: false });
      return res.data.data || [];
    } catch (err) {
      if (isAxiosError(err)) {
        set({ error: err.response?.data?.error || 'Unknown error', loading: false });
      } else {
        set({ error: 'Unknown error', loading: false });
      }
      return { error: 'Failed to fetch organizations' };
    }
  },
  deactivateOrganization: async (organizationName: string) => {
    try {
      await axios.patch(`/v1/organizations/${organizationName}`, { isActive: false });
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else {
        return { error: 'Unknown error occurred while deactivating organization' };
      }
    }
  },
  deleteOrganization: async (organizationName: string) => {
    try {
      await axios.delete(`/v1/organizations/${organizationName}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      } else {
        return { error: 'Unknown error occurred while deleting organization' };
      }
    }
  },
  createOrganization: async (data: Partial<Organization>) => {
    try {
      await axios.post('/v1/organizations', data);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        return { error: err.response.data.error };
      }
      else {
        return { error: 'Unknown error occurred while creating organization' };
      }
    }
  },
}));
