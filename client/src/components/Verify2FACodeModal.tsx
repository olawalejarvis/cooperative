import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { CAModal } from './CAModal';

interface TwoFactorModalProps {
  show: boolean;
  onSubmit: (code: string) => void;
  onHide: () => void;
  loading?: boolean;
  error?: string | null;
}

export const Verify2FACodeModal: React.FC<TwoFactorModalProps> = ({ show, onSubmit, onHide, loading, error }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <CAModal
      show={show}
      onHide={onHide}
      title="Two-Factor Authentication"
      footer={null}
    >
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
    </CAModal>
  );
};
