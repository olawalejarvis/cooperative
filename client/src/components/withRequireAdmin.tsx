import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { UserPermission } from '../utils/UserPermission';

export function withRequireAdmin<P extends object>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const { user, loading } = useAuthStore();
    const navigate = useNavigate();
    const location = window.location.pathname + window.location.search;

    useEffect(() => {
      if (!loading && !user) {
        // Save intended route before redirecting to login
        const match = window.location.pathname.match(/^\/(\w+)/);
        const orgName = match ? match[1] : 'root';
        navigate(`/${orgName}/login?redirect=${encodeURIComponent(location)}`);
      }
    }, [user, loading, navigate, location]);

    if (loading) return <div>Loading...</div>;
    if (!user || !UserPermission.isAdmin(user.role)) return <div className="alert alert-danger">Access denied: Admins only</div>;

    return <Component {...props} />;
  };

  Wrapped.displayName = `withRequireAdmin(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
