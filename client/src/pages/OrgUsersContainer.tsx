import React, { useEffect, useState } from 'react';
import OrgUsersPage from './OrgUsersPage';
import { useUserStore } from '../store/user';
import { useAuthStore } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';
import { useParams } from 'react-router-dom';
import { withRequireAdmin } from '../components/withRequireAdmin';

export const OrgUsersContainer: React.FC = () => {
  const { organizationName } = useParams<{ organizationName: string }>();
  const orgName = organizationName || '';
  const [filter, setFilter] = useState<'org' | 'all'>('org');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const fetchOrgUsers = useUserStore((s) => s.fetchOrgUsers);
  const fetchAllUsers = useUserStore((s) => s.fetchAllUsers);
  const orgUsers = useUserStore((s) => s.orgUsers);
  const allUsers = useUserStore((s) => s.allUsers);
  const loading = useUserStore((s) => s.loading);
  const error = useUserStore((s) => s.error);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (filter === 'org') {
      fetchOrgUsers(orgName, sortBy, sortOrder);
    } else if (filter === 'all' && UserPermission.isRootUser(user?.role)) {
      fetchAllUsers(sortBy, sortOrder);
    }
  }, [filter, orgName, sortBy, sortOrder, fetchOrgUsers, fetchAllUsers, user]);

  const users = filter === 'org' ? orgUsers : allUsers;

  return (
    <OrgUsersPage
      users={users}
      loading={loading}
      error={error}
      filter={filter}
      setFilter={setFilter}
      sortBy={sortBy}
      setSortBy={setSortBy}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      isRoot={UserPermission.isRootUser(user?.role)}
    />
  );
};

export const AuthOrgsUsers = withRequireAdmin(OrgUsersContainer);
