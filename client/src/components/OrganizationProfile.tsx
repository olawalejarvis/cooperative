// OrganizationProfile.tsx
import React, { useState } from 'react';
import { CAModal } from './CAModal';
import { Button, Form } from 'react-bootstrap';
import type { Organization } from '../store/organization';
import './OrganizationProfile.css';

interface OrganizationProfileProps {
  show: boolean;
  onHide: () => void;
  organization: Organization;
  userRole?: string;
  onUpdate: (label: string) => Promise<void>;
}

const OrganizationProfile: React.FC<OrganizationProfileProps> = ({ show, onHide, organization, userRole, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [label, setLabel] = useState(organization?.label);
  const [description, setDescription] = useState(organization?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setLabel(organization.label);
    setDescription(organization.description || '');
    setError(null);
  };
  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpdate(label);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CAModal
      show={show}
      onHide={onHide}
      title="Organization Profile"
      size="lg"
      bodyClassName="orgprofile-modal-body ca-modal-scrollable"
      footer={editMode ? (
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleCancel} disabled={loading}>Cancel</Button>
          <Button variant="primary" className="rounded-pill px-4" onClick={handleUpdate} disabled={loading} style={{ background: '#3b82f6', border: 'none' }}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      ) : (
        <Button variant="primary" className="rounded-pill px-4" onClick={handleEdit} style={{ background: '#3b82f6', border: 'none' }}>Edit</Button>
      )}
    >
      <div className="orgprofile-avatar-wrapper mb-4 d-flex flex-column align-items-center justify-content-center">
        <div className="orgprofile-avatar mb-2">
          <span>{organization.label ? organization.label[0] : 'O'}</span>
        </div>
        <div className="fw-bold" style={{ fontSize: '1.15rem', color: '#3b82f6' }}>{organization.label}</div>
        <div className="text-muted" style={{ fontSize: '0.98rem' }}>{organization.name}</div>
      </div>
      <Form className="orgprofile-form mx-auto" style={{ maxWidth: 420 }}>
        <Form.Group className="mb-3">
          <Form.Label>Organization Name</Form.Label>
          <Form.Control
            type="text"
            value={organization.name}
            readOnly
            className="orgprofile-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Label</Form.Label>
          <Form.Control
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            readOnly={!editMode}
            className="orgprofile-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            readOnly={!editMode}
            className="orgprofile-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Control type="text" value={userRole || ''} readOnly className="orgprofile-input" />
        </Form.Group>
        {error && <div className="text-danger mb-2">{error}</div>}
      </Form>
    </CAModal>
  );
};

export default OrganizationProfile;
