import React, { useState } from 'react';
import { CAModal } from './CAModal';
import { Button, Form } from 'react-bootstrap';
import './UserProfile.css';

interface UserProfileProps {
  show: boolean;
  onHide: () => void;
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    userName?: string;
    phoneNumber?: string;
    role?: string;
  };
  onUpdate: (firstName: string, lastName: string) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ show, onHide, user, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setError(null);
  };
  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpdate(firstName, lastName);
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
      title="My Profile"
      size="lg"
      bodyClassName="userprofile-modal-body ca-modal-scrollable"
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
      <div className="userprofile-avatar-wrapper mb-4 d-flex flex-column align-items-center justify-content-center">
        <div className="userprofile-avatar mb-2">
          <span>{user.firstName[0]}{user.lastName[0]}</span>
        </div>
        <div className="fw-bold" style={{ fontSize: '1.15rem', color: '#3b82f6' }}>{user.firstName} {user.lastName}</div>
        <div className="text-muted" style={{ fontSize: '0.98rem' }}>{user.email}</div>
      </div>
      <Form className="userprofile-form mx-auto" style={{ maxWidth: 420 }}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={!editMode}
            className="userprofile-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={!editMode}
            className="userprofile-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="text" value={user.email || ''} readOnly className="userprofile-input" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" value={user.userName || ''} readOnly className="userprofile-input" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control type="text" value={user.phoneNumber || ''} readOnly className="userprofile-input" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Control type="text" value={user.role || ''} readOnly className="userprofile-input" />
        </Form.Group>
        {error && <div className="text-danger mb-2">{error}</div>}
      </Form>
    </CAModal>
  );
};

export default UserProfile;
