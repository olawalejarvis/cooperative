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
  <BootstrapModal show={show} onHide={onHide} centered={centered} size={size}>
    {title && (
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
    )}
    <BootstrapModal.Body className={bodyClassName}>{children}</BootstrapModal.Body>
    {footer && <BootstrapModal.Footer>{footer}</BootstrapModal.Footer>}
  </BootstrapModal>
);
