import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import './CAModal.css';

interface CAModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  centered?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  bodyClassName?: string;
}

export const CAModal: React.FC<CAModalProps> = ({ show, onHide, title, children, footer, centered = true, size, bodyClassName }) => (
  <BootstrapModal
    show={show}
    onHide={onHide}
    centered={centered}
    size={size}
    dialogClassName="camodal-financial-dialog"
    contentClassName="camodal-financial-content"
  >
    {title && (
      <BootstrapModal.Header closeButton className="camodal-financial-header">
        <BootstrapModal.Title as="h5" className="fw-bold camodal-title">
          <span className="camodal-title-icon me-2">
            <svg width="22" height="22" fill="#3b82f6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e0eafc"/><path d="M7 13l3 3 7-7" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
          </span>
          {title}
        </BootstrapModal.Title>
      </BootstrapModal.Header>
    )}
    <BootstrapModal.Body className={bodyClassName + ' camodal-financial-body'}>{children}</BootstrapModal.Body>
    {footer && <BootstrapModal.Footer className="camodal-financial-footer">{footer}</BootstrapModal.Footer>}
  </BootstrapModal>
);
