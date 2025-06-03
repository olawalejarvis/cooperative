import React, { useState } from 'react';
import { CATable } from '../components/CATable';
import { CAModal } from '../components/CAModal';
import { Button } from 'react-bootstrap';
import type { Organization } from '../store/organization';
import { useOrganizationStore } from '../store/organization';

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
      <>
        <Button size="sm" variant="info" className="me-2" onClick={() => handleView(row)}>View</Button>
        <Button size="sm" variant="warning" className="me-2" onClick={() => handleDeactivate(row)} disabled={!row.isActive}>Deactivate</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>Delete</Button>
      </>
    ) },
  ];

  return (
    <div className="container mt-5">
      <h2>Organizations</h2>
      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Filter by name or label..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ maxWidth: 300 }}
        />
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
        footer={modalType === 'view' ? (
          <Button variant="secondary" onClick={handleModalClose}>Close</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleModalClose} disabled={actionLoading}>Cancel</Button>
            <Button variant={modalType === 'delete' ? 'danger' : 'warning'} onClick={handleConfirmAction} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </>
        )}
      >
        {modalType === 'view' && modalOrg && (
          <pre className="bg-light p-3 rounded small">{JSON.stringify(modalOrg, null, 2)}</pre>
        )}
        {(modalType === 'deactivate' || modalType === 'delete') && modalOrg && (
          <p>Are you sure you want to {modalType} <b>{String(modalOrg.name)}</b>? This action cannot be undone.</p>
        )}
      </CAModal>
    </div>
  );
};

export default OrganizationsPage;
