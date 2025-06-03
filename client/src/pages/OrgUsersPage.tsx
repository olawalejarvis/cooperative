import React, { useState } from 'react';
import type { OrgUser } from '../store/user';
import { UserPermission } from '../utils/UserPermission';
import { Button } from 'react-bootstrap';
import { useOrganizationStore } from '../store/organization';
import { CATable } from '../components/CATable';
import type { TableColumn } from '../components/CATable';
import { useAuthStore } from '../store/auth';
import { CAModal } from '../components/CAModal';
import './OrgUsersPage.css';

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
        <div className="d-flex gap-2 align-items-center">
          <Button
            variant={orgUser.isActive ? 'outline-warning' : 'outline-success'}
            size="sm"
            className="orgusers-action-btn rounded-pill px-3 fw-semibold"
            style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(80,120,200,0.07)' }}
            onClick={() => handleDeactivate(orgUser)}
          >
            {orgUser.isActive ? (
              <><svg width="16" height="16" fill="#f59e42" viewBox="0 0 16 16" className="me-1"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm-2-7a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/></svg>Deactivate</>
            ) : (
              <><svg width="16" height="16" fill="#10b981" viewBox="0 0 16 16" className="me-1"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm2-7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>Activate</>
            )}
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline-danger"
              size="sm"
              className="orgusers-action-btn rounded-pill px-3 fw-semibold"
              style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(200,80,80,0.07)' }}
              onClick={() => handleDelete(orgUser)}
            >
              <svg width="16" height="16" fill="#ef4444" viewBox="0 0 16 16" className="me-1"><path d="M6.5 1.5A1.5 1.5 0 0 1 8 0a1.5 1.5 0 0 1 1.5 1.5V2H14a1 1 0 0 1 0 2h-1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H2a1 1 0 0 1 0-2h4.5v-.5zm1 0V2h-1v-.5a.5.5 0 0 1 1 0zM5 4v9h6V4H5z"/></svg>
              Delete
            </Button>
          )}
        </div>
      );
    } },
  ];

  // Cast users to Record<string, unknown>[] for CATable compatibility
  const tableData = users.map(u => ({ ...u } as Record<string, unknown>));

  return (
    <div className="orgusers-container container mt-5">
      <div className="orgusers-header d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="orgusers-title mb-1">Organization Users</h2>
          <div className="orgusers-subtitle text-muted" style={{ fontSize: '1.04rem' }}>
            Manage users in your organization
          </div>
        </div>
        <div className="orgusers-filter-dropdown">
          <select
            className="form-select rounded-pill px-4 fw-semibold shadow-sm"
            style={{ fontSize: '1.01rem', background: '#f6f8fa', color: '#3b82f6', border: '1.5px solid #e0eafc', minWidth: 170 }}
            value={filter}
            onChange={e => setFilter(e.target.value as 'org' | 'all')}
            disabled={!isRoot && filter === 'all'}
          >
            <option value="org">Org Users</option>
            <option value="all" disabled={!isRoot}>All Users</option>
          </select>
        </div>
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
        title={modalAction === 'delete' ? 'Delete User' : modalAction === 'deactivate' ? (modalUser?.isActive ? 'Deactivate User' : 'Activate User') : ''}
        size="lg"
        bodyClassName="orgusers-modal-body"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant={modalAction === 'delete' ? 'danger' : 'primary'} className="rounded-pill px-4" onClick={handleConfirm}>
              {modalAction === 'delete' ? 'Delete' : modalUser?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        }
      >
        {modalAction === 'delete' ? (
          <div className="text-center">
            <svg width="38" height="38" fill="#ef4444" viewBox="0 0 24 24" className="mb-2"><circle cx="12" cy="12" r="10" fill="#fbeaea"/><path d="M7 13l3 3 7-7" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
            <div className="fw-bold mb-2" style={{ color: '#ef4444', fontSize: '1.1rem' }}>Are you sure you want to delete this user?</div>
            <div className="text-muted mb-2">This action cannot be undone.</div>
            {modalUser && <div className="mb-2"><strong>User:</strong> {modalUser.firstName} {modalUser.lastName} ({modalUser.email})</div>}
          </div>
        ) : (
          <div className="text-center">
            <svg width="38" height="38" fill="#f59e42" viewBox="0 0 24 24" className="mb-2"><circle cx="12" cy="12" r="10" fill="#fdf6e3"/><path d="M7 13l3 3 7-7" stroke="#f59e42" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
            <div className="fw-bold mb-2" style={{ color: '#f59e42', fontSize: '1.1rem' }}>{modalUser?.isActive ? 'Deactivate' : 'Activate'} this user?</div>
            {modalUser && <div className="mb-2"><strong>User:</strong> {modalUser.firstName} {modalUser.lastName} ({modalUser.email})</div>}
          </div>
        )}
      </CAModal>
    </div>
  );
};

export default OrgUsersPage;
