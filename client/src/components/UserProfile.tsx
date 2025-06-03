import React, { useState } from 'react';
import { CAModal } from './CAModal';
import { Button, Form } from 'react-bootstrap';

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
      footer={editMode ? (
        <>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={handleEdit}>Edit</Button>
      )}
      bodyClassName="ca-modal-scrollable"
      size="lg"
    >
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={!editMode}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={!editMode}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="text" value={user.email || ''} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" value={user.userName || ''} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control type="text" value={user.phoneNumber || ''} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Control type="text" value={user.role || ''} readOnly />
        </Form.Group>
        {error && <div className="text-danger mb-2">{error}</div>}
      </Form>
    </CAModal>
  );
};

export default UserProfile;
