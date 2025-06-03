import React from 'react';
import { useAuthStore } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';

interface RequireRootProps {
  children: React.ReactNode;
}

const RequireRoot: React.FC<RequireRootProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!UserPermission.isRootUser(user?.role)) {
    return <div className="container mt-5"><h3>Forbidden</h3><p>Only root users can access this page.</p></div>;
  }
  return <>{children}</>;
};

export default RequireRoot;
