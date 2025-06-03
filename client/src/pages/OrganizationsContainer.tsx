import React, { useEffect, useState, useCallback } from 'react';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';
import OrganizationsPage from './OrganizationsPage';
import type { Organization } from '../store/organization';
import { withRequireRoot } from '../components/withRequireRoot';

const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_ORDER = 'desc';
const DEFAULT_LIMIT = 20;

const OrganizationsContainer: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_SORT_ORDER);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orgs = await fetchOrganizations({ q: filter, sortBy, sortOrder, page, limit });
      setOrganizations(orgs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, [fetchOrganizations, filter, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  if (!user) return null;

  const mappedOrganizations = organizations.map(org => ({ ...org }));

  return (
    <OrganizationsPage
      organizations={mappedOrganizations}
      loading={loading}
      error={error}
      sortBy={sortBy}
      setSortBy={setSortBy}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      filter={filter}
      setFilter={setFilter}
      page={page}
      setPage={setPage}
      limit={limit}
      reload={loadOrganizations}
    />
  );
};

const RootProtectedOrganizationsContainer = withRequireRoot(OrganizationsContainer);
export default RootProtectedOrganizationsContainer;
