import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import type { Transaction } from '../store/transaction';
import { UserPermission } from '../utils/UserPermission';

interface TransactionModalProps {
  show: boolean;
  onHide: () => void;
  transaction: Transaction | null;
  userRole?: string;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

const statusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'pending', label: 'Pending' },
];

export default function TransactionModal({ show, onHide, transaction, userRole, onUpdateStatus }: TransactionModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState(transaction?.status || 'pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setStatus(transaction?.status || 'pending');
    setEditMode(false);
    setError(null);
  }, [transaction, show]);

  const isAdmin = UserPermission.isAdmin(userRole);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setStatus(transaction?.status || 'pending');
    setError(null);
  };
  const handleUpdate = async () => {
    if (!transaction) return;
    setLoading(true);
    setError(null);
    try {
      await onUpdateStatus(transaction.id, status);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Transaction Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div><strong>ID:</strong> {transaction.id}</div>
        <div><strong>Amount:</strong> {transaction.formattedAmount || transaction.amount}</div>
        <div><strong>Type:</strong> {transaction.type}</div>
        <div><strong>Method:</strong> {transaction.method}</div>
        <div><strong>Created At:</strong> {transaction.createdAt}</div>
        <div><strong>Status:</strong> {editMode ? (
          <Form.Select value={status} onChange={e => setStatus(e.target.value)} disabled={!isAdmin || loading}>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        ) : (
          <span>{transaction.status}</span>
        )}</div>
        {error && <div className="text-danger mt-2">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        {editMode ? (
          <>
            <Button variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdate} disabled={loading || !isAdmin}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </>
        ) : (
          isAdmin && <Button variant="primary" onClick={handleEdit}>Edit</Button>
        )}
        <Button variant="outline-secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
