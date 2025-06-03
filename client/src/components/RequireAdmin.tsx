import React from 'react';
import { useAuthStore } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';

interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user || !UserPermission.isAdmin(user.role)) {
    return <div className="alert alert-danger">Access denied: Admins only</div>;
  }
  return <>{children}</>;
};

export default RequireAdmin;
