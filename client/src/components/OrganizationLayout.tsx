import React from 'react';
import AppNavBar from '../components/AppNavBar';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import Footer from './Footer';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

const OrganizationLayout: React.FC<OrganizationLayoutProps> = ({ children }) => {
  const organization = useOrganizationStore((state) => state.organization);
  const updateOrganization = useOrganizationStore((state) => state.updateOrganization);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const organizationName = organization?.name;

  const handleLogout = () => {
    logout(organizationName);
  };
  const handleProfileUpdate = async (firstName: string, lastName: string) => {
    if (!user?.id) return;
    await updateProfile(organizationName, user.id, firstName, lastName, setUser);
  };
  const handleOrganizationUpdate = async (label: string) => {
    if (!organizationName) return;
    await updateOrganization(organizationName, label);
  };

  return (
    <>
      <AppNavBar
        organization={organization}
        user={user}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
        onOrganizationUpdate={handleOrganizationUpdate}
      />
      {children}
      <div style={{ flex: 1 }} />
      <Footer organization={organization} />
    </>
  );
};

export default OrganizationLayout;
