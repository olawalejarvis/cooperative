import React from 'react';
import type { Organization } from '../store/organization';
import './Footer.css';

interface FooterProps {
  organization?: Organization | null;
}

const Footer: React.FC<FooterProps> = ({ organization }) => {
  return (
    <footer className="org-footer bg-dark text-light py-3 mt-5">
      <div className="container text-center">
        <small style={{ fontSize: '1rem', opacity: 0.85 }}>
          {organization?.description ? (
            <>
              <span className="org-footer-desc">{organization.description}</span>
            </>
          ) : (
            <span className="text-muted">No organization description available.</span>
          )}
        </small>
      </div>
    </footer>
  );
};

export default Footer;
