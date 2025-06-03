import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import type { Transaction } from '../store/transaction';
import { UserPermission } from '../utils/UserPermission';
import { CAModal } from './CAModal';
import './TransactionModal.css';

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
    <CAModal show={show} onHide={onHide} size="lg" title="Transaction Details" bodyClassName="transaction-modal-body" footer={null}>
      <div className="transaction-modal-content">
        <div className="transaction-modal-row mb-2">
          <span className="transaction-modal-label">ID:</span>
          <span className="transaction-modal-value">{transaction.id}</span>
        </div>
        <div className="transaction-modal-row mb-2">
          <span className="transaction-modal-label">Amount:</span>
          <span className="transaction-modal-value">{transaction.formattedAmount || transaction.amount}</span>
        </div>
        <div className="transaction-modal-row mb-2">
          <span className="transaction-modal-label">Type:</span>
          <span className="transaction-modal-value">{transaction.type}</span>
        </div>
        <div className="transaction-modal-row mb-2">
          <span className="transaction-modal-label">Method:</span>
          <span className="transaction-modal-value">{transaction.method}</span>
        </div>
        <div className="transaction-modal-row mb-2">
          <span className="transaction-modal-label">Created At:</span>
          <span className="transaction-modal-value">{transaction.createdAt}</span>
        </div>
        <div className="transaction-modal-row mb-2">
          <span className="transaction-modal-label">Status:</span>
          <span className="transaction-modal-value">
            {editMode ? (
              <Form.Select value={status} onChange={e => setStatus(e.target.value)} disabled={!isAdmin || loading} className="transaction-modal-select">
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            ) : (
              <span>{transaction.status}</span>
            )}
          </span>
        </div>
        {error && <div className="text-danger mt-2">{error}</div>}
      </div>
      <div className="transaction-modal-footer d-flex gap-2 justify-content-end mt-3">
        {editMode ? (
          <>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleCancel} disabled={loading}>Cancel</Button>
            <Button variant="primary" className="rounded-pill px-4" onClick={handleUpdate} disabled={loading || !isAdmin} style={{ background: '#3b82f6', border: 'none' }}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </>
        ) : (
          isAdmin && <Button variant="primary" className="rounded-pill px-4" onClick={handleEdit} style={{ background: '#3b82f6', border: 'none' }}>Edit</Button>
        )}
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={onHide}>Close</Button>
      </div>
    </CAModal>
  );
}
