import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
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
    if (!user) return null;

    return <Component {...props} />;
  };
}
