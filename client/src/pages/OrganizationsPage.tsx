import React, { useState } from 'react';
import { CATable } from '../components/CATable';
import { CAModal } from '../components/CAModal';
import { Button } from 'react-bootstrap';
import type { Organization } from '../store/organization';
import { useOrganizationStore } from '../store/organization';
import OrganizationProfile from '../components/OrganizationProfile';
import { useAuthStore } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';
import './OrganizationsPage.css';
import type { User } from '../store/user';

interface OrganizationsPageProps {
  organizations: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
  filter: string;
  setFilter: (f: string) => void;
  reload: () => void;
}

const OrganizationsPage: React.FC<OrganizationsPageProps> = ({
  organizations, loading, error, sortBy, setSortBy, sortOrder, setSortOrder, filter, setFilter, reload
}) => {
  const [modalOrg, setModalOrg] = useState<Record<string, unknown> | null>(null);
  const [modalType, setModalType] = useState<'view' | 'deactivate' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileOrg, setProfileOrg] = useState<Organization | null>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    label: '',
    description: '',
    logoUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const organizationStore = useOrganizationStore();
  const authUser = useAuthStore(state => state.user);
  const isRoot = UserPermission.isRootUser(authUser?.role);

  const handleView = (org: Record<string, unknown>) => {
    // Map Record<string, unknown> to Organization
    const mappedOrg: Organization = {
      id: String(org.id),
      name: String(org.name),
      label: String(org.label),
      isActive: Boolean(org.isActive),
      deleted: Boolean(org.deleted),
      createdAt: String(org.createdAt),
      updatedAt: String(org.updatedAt),
      description: typeof org.description === 'string' ? org.description : '',
      logoUrl: typeof org.logoUrl === 'string' ? org.logoUrl : undefined,
      createdBy: org.createdBy as User | undefined, // Optionally map this if needed
    };
    setProfileOrg(mappedOrg);
    setProfileEditMode(false);
  };
  const handleDeactivate = (org: Record<string, unknown>) => {
    setModalOrg(org);
    setModalType('deactivate');
  };
  const handleDelete = (org: Record<string, unknown>) => {
    setModalOrg(org);
    setModalType('delete');
  };
  const handleModalClose = () => {
    setModalOrg(null);
    setModalType(null);
    setActionLoading(false);
  };
  const handleProfileHide = () => {
    setProfileOrg(null);
    setProfileEditMode(false);
    setProfileLoading(false);
  };
  const handleProfileUpdate = async (label: string, name: string, description: string) => {
    if (!profileOrg) return;
    setProfileLoading(true);
    try {
      await organizationStore.updateOrganization(profileOrg.name, label, name, description);
      handleProfileHide();
      reload();
    } finally {
      setProfileLoading(false);
    }
  };
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleOpenCreate = () => {
    setCreateForm({ name: '', label: '', description: '', logoUrl: '' });
    setCreateError(null);
    setShowCreateModal(true);
  };
  const handleCloseCreate = () => setShowCreateModal(false);
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      if (!createForm.name || !createForm.label) {
        setCreateError('Name and label are required.');
        setCreateLoading(false);
        return;
      }
      await organizationStore.createOrganization?.(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', label: '', description: '', logoUrl: '' });
      reload();
    } catch (err: unknown) {
      if (err instanceof Error) setCreateError(err.message);
      else setCreateError('Failed to create organization');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!modalOrg || !modalType) return;
    setActionLoading(true);
    try {
      if (modalType === 'deactivate') {
        await organizationStore.deactivateOrganization(String(modalOrg.name));
      } else if (modalType === 'delete') {
        await organizationStore.deleteOrganization(String(modalOrg.name));
      }
      handleModalClose();
      reload();
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortBy: true },
    { key: 'label', label: 'Label', sortBy: true },
    { key: 'isActive', label: 'Active', sortBy: true, render: (row: Record<string, unknown>) => row.isActive ? 'Yes' : 'No' },
    { key: 'createdAt', label: 'Created', sortBy: true, render: (row: Record<string, unknown>) => row.createdAt ? new Date(row.createdAt as string).toLocaleString() : '' },
    { key: 'actions', label: 'Actions', sortBy: false, render: (row: Record<string, unknown>) => (
      <div className="d-flex gap-2 align-items-center">
        <Button size="sm" variant="outline-primary" className="orgs-action-btn rounded-pill px-3 fw-semibold" style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(80,120,200,0.07)' }} onClick={e => { e.stopPropagation(); handleView(row); }}>
          <svg width="16" height="16" fill="#3b82f6" viewBox="0 0 16 16" className="me-1"><path d="M8 3.5c-3.5 0-6 3.5-6 4.5s2.5 4.5 6 4.5 6-3.5 6-4.5-2.5-4.5-6-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
          View
        </Button>
        <Button size="sm" variant="outline-warning" className="orgs-action-btn rounded-pill px-3 fw-semibold" style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(200,180,80,0.07)' }} onClick={e => { e.stopPropagation(); handleDeactivate(row); }} disabled={!row.isActive}>
          <svg width="16" height="16" fill="#f59e42" viewBox="0 0 16 16" className="me-1"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm-2-7a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/></svg>
          Deactivate
        </Button>
        <Button size="sm" variant="outline-danger" className="orgs-action-btn rounded-pill px-3 fw-semibold" style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(200,80,80,0.07)' }} onClick={e => { e.stopPropagation(); handleDelete(row); }}>
          <svg width="16" height="16" fill="#ef4444" viewBox="0 0 16 16" className="me-1"><path d="M6.5 1.5A1.5 1.5 0 0 1 8 0a1.5 1.5 0 0 1 1.5 1.5V2H14a1 1 0 0 1 0 2h-1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H2a1 1 0 0 1 0-2h4.5v-.5zm1 0V2h-1v-.5a.5.5 0 0 1 1 0zM5 4v9h6V4H5z"/></svg>
          Delete
        </Button>
      </div>
    ) },
  ];

  return (
    <div className="orgs-container container mt-5">
      <div className="orgs-header d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="orgs-title mb-1">Organizations</h2>
          <div className="orgs-subtitle text-muted" style={{ fontSize: '1.04rem' }}>
            Manage all organizations in the system
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isRoot && (
            <Button
              className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
              style={{ fontSize: '1.01rem', background: '#3b82f6', border: 'none' }}
              onClick={handleOpenCreate}
            >
              + Create New Organization
            </Button>
          )}
          <div className="orgs-filter-input">
            <input
              type="text"
              className="form-control rounded-pill px-4 fw-semibold shadow-sm"
              style={{ fontSize: '1.01rem', background: '#f6f8fa', color: '#3b82f6', border: '1.5px solid #e0eafc', minWidth: 220 }}
              placeholder="Filter by name or label..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      <CATable
        columns={columns}
        data={organizations}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => { setSortBy(field); setSortOrder(order); }}
        onRowClick={handleView}
      />
      <OrganizationProfile
        show={!!profileOrg}
        onHide={handleProfileHide}
        organization={profileOrg as Organization}
        onUpdate={handleProfileUpdate}
        editMode={profileEditMode}
        setEditMode={setProfileEditMode}
        loading={profileLoading}
      />
      <CAModal
        show={!!modalOrg && !!modalType}
        onHide={handleModalClose}
        title={modalType === 'deactivate' ? 'Deactivate Organization' : 'Delete Organization'}
        size="lg"
        bodyClassName="orgs-modal-body"
        footer={modalType === 'view' ? (
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleModalClose}>Close</Button>
        ) : (
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleModalClose} disabled={actionLoading}>Cancel</Button>
            <Button variant={modalType === 'delete' ? 'danger' : 'warning'} className="rounded-pill px-4" onClick={handleConfirmAction} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        )}
      >
        {(modalType === 'deactivate' || modalType === 'delete') && modalOrg && (
          <div className="text-center">
            <svg width="38" height="38" fill={modalType === 'delete' ? '#ef4444' : '#f59e42'} viewBox="0 0 24 24" className="mb-2"><circle cx="12" cy="12" r="10" fill={modalType === 'delete' ? '#fbeaea' : '#fdf6e3'} /><path d="M7 13l3 3 7-7" stroke={modalType === 'delete' ? '#ef4444' : '#f59e42'} strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
            <div className="fw-bold mb-2" style={{ color: modalType === 'delete' ? '#ef4444' : '#f59e42', fontSize: '1.1rem' }}>
              Are you sure you want to {modalType} this organization?
            </div>
            <div className="text-muted mb-2">This action cannot be undone.</div>
            <div className="mb-2"><strong>Organization:</strong> {String(modalOrg.label)} ({String(modalOrg.name)})</div>
          </div>
        )}
      </CAModal>
      <CAModal show={showCreateModal} onHide={handleCloseCreate} title="Create New Organization" size="lg">
        <form onSubmit={handleCreateSubmit} className="d-flex flex-column gap-3 p-2">
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="form-label fw-semibold">Name</label>
              <input type="text" name="name" className="form-control rounded-pill px-3" value={createForm.name} onChange={handleCreateChange} required />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label fw-semibold">Label</label>
              <input type="text" name="label" className="form-control rounded-pill px-3" value={createForm.label} onChange={handleCreateChange} required />
            </div>
          </div>
          <div className="row">
            <div className="col-12 mb-2">
              <label className="form-label fw-semibold">Description</label>
              <textarea name="description" className="form-control rounded-4 px-3" value={createForm.description} onChange={handleCreateChange} rows={3} />
            </div>
          </div>
          <div className="row">
            <div className="col-12 mb-2">
              <label className="form-label fw-semibold">Logo URL</label>
              <input type="text" name="logoUrl" className="form-control rounded-pill px-3" value={createForm.logoUrl} onChange={handleCreateChange} />
            </div>
          </div>
          {createError && <div className="text-danger fw-semibold">{createError}</div>}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={handleCloseCreate} disabled={createLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary rounded-pill px-4" style={{ background: '#3b82f6', border: 'none' }} disabled={createLoading}>
              {createLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </CAModal>
    </div>
  );
};

export default OrganizationsPage;
