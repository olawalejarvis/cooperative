import React, { useState } from 'react';
import type { OrgUser } from '../store/user';
import { UserPermission } from '../utils/UserPermission';
import { Button } from 'react-bootstrap';
import { useOrganizationStore } from '../store/organization';
import { CATable } from '../components/CATable';
import type { TableColumn } from '../components/CATable';
import { useAuthStore } from '../store/auth';
import { CAModal } from '../components/CAModal';

interface OrgUsersPageProps {
  users: OrgUser[];
  loading: boolean;
  error: string | null;
  filter: 'org' | 'all';
  setFilter: (f: 'org' | 'all') => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
  isRoot: boolean;
}

const OrgUsersPage: React.FC<OrgUsersPageProps> = ({
  users, loading, error, filter, setFilter, sortBy, setSortBy, sortOrder, setSortOrder, isRoot
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<OrgUser | null>(null);
  const [modalAction, setModalAction] = useState<'delete' | 'deactivate' | null>(null);
  const organizationStore = useOrganizationStore();
  const currentUser = useAuthStore((state) => state.user);
  const orgName = organizationStore.organization?.name || '';
  const isSuperAdmin = UserPermission.isSuperAdmin(currentUser?.role);

  const handleDelete = (user: OrgUser) => {
    setModalUser(user);
    setModalAction('delete');
    setShowModal(true);
  };
  const handleDeactivate = (user: OrgUser) => {
    setModalUser(user);
    setModalAction('deactivate');
    setShowModal(true);
  };
  const handleConfirm = async () => {
    if (!modalUser || !orgName) return;
    if (modalAction === 'delete') {
      await organizationStore.deleteUser(orgName, modalUser.id);
    } else if (modalAction === 'deactivate') {
      await organizationStore.setUserActive(orgName, modalUser.id, !modalUser.isActive);
    }
    setShowModal(false);
  };

  const columns: TableColumn<Record<string, unknown>>[] = [
    { key: 'firstName', label: 'First Name', sortBy: true },
    { key: 'lastName', label: 'Last Name', sortBy: true },
    { key: 'userName', label: 'Username', sortBy: true },
    { key: 'email', label: 'Email', sortBy: true },
    { key: 'role', label: 'Role', sortBy: true },
    { key: 'createdAt', label: 'Created At', sortBy: true, render: (row) => new Date(row.createdAt as string).toLocaleString() },
    { key: 'isActive', label: 'Active', sortBy: true, render: (row) => row.isActive ? 'Yes' : 'No' },
    { key: 'actions', label: 'Actions', sortBy: false, render: (row) => {
      const orgUser = row as unknown as OrgUser;
      return (
        <>
          <Button
            variant="warning"
            size="sm"
            className="me-2"
            onClick={() => handleDeactivate(orgUser)}
          >
            {orgUser.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          {isSuperAdmin && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(orgUser)}
            >
              Delete
            </Button>
          )}
        </>
      );
    } }
  ];

  // Cast users to Record<string, unknown>[] for CATable compatibility
  const tableData = users.map(u => ({ ...u } as Record<string, unknown>));

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Organization Users</h2>
        <select
          className="form-select w-auto"
          value={filter}
          onChange={e => setFilter(e.target.value as 'org' | 'all')}
          disabled={!isRoot && filter === 'all'}
        >
          <option value="org">Org Users</option>
          <option value="all" disabled={!isRoot}>All Users</option>
        </select>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <CATable
          columns={columns}
          data={tableData}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(key: string) => {
            if (sortBy === key) {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(key);
              setSortOrder('asc');
            }
          }}
        />
      </div>
      <CAModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalAction === 'delete' ? 'Delete User' : 'Change User Status'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant={modalAction === 'delete' ? 'danger' : 'warning'} onClick={handleConfirm}>
              Confirm
            </Button>
          </>
        }
      >
        {modalAction === 'delete' && (
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        )}
        {modalAction === 'deactivate' && (
          <p>Are you sure you want to {modalUser?.isActive ? 'deactivate' : 'activate'} this user?</p>
        )}
      </CAModal>
    </div>
  );
};

export default OrgUsersPage;
