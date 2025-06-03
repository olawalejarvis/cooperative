import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { useOrganizationStore } from "./store/organization";
import { useLocation } from "react-router-dom";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { hasCheckedAuth, getMe } = useAuthStore();
  const { fetchOrganization, error: orgError } = useOrganizationStore();
  const location = useLocation();

  useEffect(() => {
    // Try to extract org name from the current route
    const match = location.pathname.match(/^\/(\w+)/);
    const orgName = match ? match[1] : null;
    if (orgName) {
      fetchOrganization(orgName);
    }
    getMe();
  }, [fetchOrganization, getMe, location.pathname]);

  if (!hasCheckedAuth) return <div>Loading...</div>;
  if (orgError) throw new Error(orgError);
  return <>{children}</>;
}
