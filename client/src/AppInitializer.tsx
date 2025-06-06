import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { useOrganizationStore } from "./store/organization";
import { useLocation } from "react-router-dom";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { hasCheckedAuth, getMe } = useAuthStore();
  const { fetchCurrentOrganization, error: orgError } = useOrganizationStore();
  const location = useLocation();

  useEffect(() => {
    // Try to extract org name from the current route
    // we can't use useParams here because the app initializer runs before the route is fully resolved
    // and useParams would return undefined for orgName
    const match = location.pathname.match(/^\/(\w+)/);
    const orgName = match ? match[1] : null;
    if (orgName) {
      fetchCurrentOrganization(orgName);
      getMe(orgName);
    }
  }, [fetchCurrentOrganization, getMe, location.pathname]);

  if (!hasCheckedAuth) return <div>Loading...</div>;
  if (orgError) throw new Error(orgError);
  return <>{children}</>;
}
