// OrganizationProfile.tsx
import React, { useState } from 'react';
import { CAModal } from './CAModal';
import { Button, Form } from 'react-bootstrap';
import { UserPermission } from '../utils/UserPermission';
import type { Organization } from '../store/organization';

interface OrganizationProfileProps {
  show: boolean;
  onHide: () => void;
  organization: Organization;
  userRole?: string;
  onUpdate: (label: string) => Promise<void>;
}

const OrganizationProfile: React.FC<OrganizationProfileProps> = ({ show, onHide, organization, userRole, onUpdate }) => {
  console.log('OrganizationProfile rendered with organization:', organization);
  const [editMode, setEditMode] = useState(false);
  const [label, setLabel] = useState(organization?.label);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = UserPermission.isSuperAdmin(userRole);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setLabel(organization.label);
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
      title="Organization Info"
      footer={editMode ? (
        <>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </>
      ) : (
        isSuperAdmin && <Button variant="primary" onClick={handleEdit}>Edit</Button>
      )}
      bodyClassName="ca-modal-scrollable"
      size="lg"
    >
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Label</Form.Label>
          <Form.Control
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            readOnly={!editMode}
            // Only superAdmins can edit
            disabled={!editMode || !isSuperAdmin}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" value={organization?.name} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>ID</Form.Label>
          <Form.Control type="text" value={organization.id} readOnly />
        </Form.Group>
        {error && <div className="text-danger mb-2">{error}</div>}
      </Form>
    </CAModal>
  );
};

export default OrganizationProfile;
