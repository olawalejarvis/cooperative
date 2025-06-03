import React, { useState } from 'react';
import { CATable } from '../components/CATable';
import { CAModal } from '../components/CAModal';
import { Button } from 'react-bootstrap';
import type { Organization } from '../store/organization';
import { useOrganizationStore } from '../store/organization';
import './OrganizationsPage.css';

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
  page: number;
  setPage: (p: number) => void;
  limit: number;
  reload: () => void;
}

const OrganizationsPage: React.FC<OrganizationsPageProps> = ({
  organizations, loading, error, sortBy, setSortBy, sortOrder, setSortOrder, filter, setFilter, page, setPage, limit, reload
}) => {
  const [modalOrg, setModalOrg] = useState<Record<string, unknown> | null>(null);
  const [modalType, setModalType] = useState<'view' | 'deactivate' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const organizationStore = useOrganizationStore();

  const handleView = (org: Record<string, unknown>) => {
    setModalOrg(org);
    setModalType('view');
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
    } catch (err) {
      // Optionally show error
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
        <Button size="sm" variant="outline-primary" className="orgs-action-btn rounded-pill px-3 fw-semibold" style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(80,120,200,0.07)' }} onClick={() => handleView(row)}>
          <svg width="16" height="16" fill="#3b82f6" viewBox="0 0 16 16" className="me-1"><path d="M8 3.5c-3.5 0-6 3.5-6 4.5s2.5 4.5 6 4.5 6-3.5 6-4.5-2.5-4.5-6-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
          View
        </Button>
        <Button size="sm" variant="outline-warning" className="orgs-action-btn rounded-pill px-3 fw-semibold" style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(200,180,80,0.07)' }} onClick={() => handleDeactivate(row)} disabled={!row.isActive}>
          <svg width="16" height="16" fill="#f59e42" viewBox="0 0 16 16" className="me-1"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm-2-7a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/></svg>
          Deactivate
        </Button>
        <Button size="sm" variant="outline-danger" className="orgs-action-btn rounded-pill px-3 fw-semibold" style={{ fontSize: '0.98rem', boxShadow: '0 1px 4px rgba(200,80,80,0.07)' }} onClick={() => handleDelete(row)}>
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
      <CAModal
        show={!!modalOrg && !!modalType}
        onHide={handleModalClose}
        title={modalType === 'view' ? 'Organization Details' : modalType === 'deactivate' ? 'Deactivate Organization' : 'Delete Organization'}
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
        {modalType === 'view' && modalOrg && (
          <div className="orgs-modal-view bg-light p-3 rounded small">
            <div className="mb-2"><strong>Name:</strong> {String(modalOrg.name)}</div>
            <div className="mb-2"><strong>Label:</strong> {String(modalOrg.label)}</div>
            <div className="mb-2"><strong>Active:</strong> {modalOrg.isActive ? 'Yes' : 'No'}</div>
            <div className="mb-2"><strong>Created:</strong> {modalOrg.createdAt ? new Date(modalOrg.createdAt as string).toLocaleString() : ''}</div>
          </div>
        )}
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
    </div>
  );
};

export default OrganizationsPage;
