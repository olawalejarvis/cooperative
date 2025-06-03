import React from 'react';
import type { Organization } from '../store/organization';
import './Footer.css';

interface FooterProps {
  organization?: Organization | null;
}

const Footer: React.FC<FooterProps> = ({ organization }) => {
  return (
    <footer className="org-footer-financial py-4 mt-5">
      <div className="container text-center">
        <div className="footer-logo mb-2 d-flex justify-content-center align-items-center">
          <svg width="28" height="28" fill="#3b82f6" viewBox="0 0 24 24" className="me-2">
            <circle cx="12" cy="12" r="10" fill="#e0eafc" />
            <path
              d="M7 13l3 3 7-7"
              stroke="#3b82f6"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span className="footer-org-label fw-bold">
            {organization?.label || 'Cooperative App'}
          </span>
        </div>
        <small style={{ fontSize: '1rem', opacity: 0.85 }}>
          {organization?.description ? (
            <span className="org-footer-desc">{organization.description}</span>
          ) : (
            <span className="text-muted">No organization description available.</span>
          )}
        </small>
        <div
          className="footer-meta mt-2 text-muted"
          style={{ fontSize: '0.97rem' }}
        >
          &copy; {new Date().getFullYear()}{' '}
          {organization?.label || 'Cooperative App'} &mdash; All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
