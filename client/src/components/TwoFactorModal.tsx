import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';

interface TwoFactorModalProps {
  show: boolean;
  onSubmit: (code: string) => void;
  onHide: () => void;
  loading?: boolean;
  error?: string | null;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ show, onSubmit, loading, error }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title>Two-Factor Authentication</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="2faCode">
            <Form.Label>Enter 2FA Code</Form.Label>
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="6-digit code"
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button variant="primary" type="submit" disabled={loading} className="w-100">
            {loading ? <Spinner size="sm" animation="border" /> : 'Verify'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TwoFactorModal;
