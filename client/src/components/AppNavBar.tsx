import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserPermission } from '../utils/UserPermission';
import type { Organization } from '../store/organization';
import type { User } from '../store/auth';
import UserProfile from './UserProfile';
import OrganizationProfile from './OrganizationProfile';
import './AppNavBar.css';

export interface AppNavBarProps {
  organization?: Organization | null;
  user?: User | null;
  onLogout: () => void;
  onProfileUpdate: (firstName: string, lastName: string) => Promise<void>;
  onOrganizationUpdate: (label: string) => Promise<void>;
}

const AppNavBar: React.FC<AppNavBarProps> = (props) => {
  const { user, organization } = props;
  const [showProfile, setShowProfile] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const navigate = useNavigate();

  // Event handlers only, no store logic
  const handleShowProfile = () => setShowProfile(true);
  const handleHideProfile = () => setShowProfile(false);
  const handleShowOrgModal = () => setShowOrgModal(true);
  const handleHideOrgModal = () => setShowOrgModal(false);
  const handleLogout = () => {
    if (props.onLogout) props.onLogout();
  };

  return (
    <Navbar collapseOnSelect expand="md" bg="white" variant="light" sticky="top" className="app-navbar-financial shadow-sm py-2">
      <Container>
        <Navbar.Brand as={Link} to={`/${organization?.name || ''}`} className="fw-bold d-flex align-items-center app-navbar-brand">
          <svg width="28" height="28" fill="#3b82f6" viewBox="0 0 24 24" className="me-2"><circle cx="12" cy="12" r="10" fill="#e0eafc"/><path d="M7 13l3 3 7-7" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
          <span>{organization?.label}</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {/* {UserPermission.isRootUser(user?.role) && (
              <Nav.Link as={Link} to={`/${organization?.name}/organizations`}>
                Organizations
              </Nav.Link>
            )}
            {UserPermission.isAdmin(user?.role) && (
              <Nav.Link as={Link} to="/users">
                Users
              </Nav.Link>
            )}
            {UserPermission.isUser(user?.role) && (
              <Nav.Link as={Link} to={`/${organization?.name}/transactions`}>
                Transactions
              </Nav.Link>
            )} */}
            {/* Add more links as needed */}
          </Nav>
          <Nav>
            {user && (
              <NavDropdown
                id="nav-dropdown-dark-example"
                title={<span className="d-flex align-items-center"><span className="avatar-circle me-2">{user.firstName[0]}{user.lastName[0]}</span>{user.firstName} {user.lastName}</span>}
                menuVariant="light"
                className="app-navbar-dropdown"
                align="end"
              >
                <NavDropdown.Item
                  href="#action/3.1"
                  onClick={handleShowProfile}
                >
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Item
                  as={Link}
                  to={user && organization ? `/${organization.name}/transactions` : '/'}
                >
                  Transactions
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2" onClick={handleShowOrgModal}>
                  My Organization
                </NavDropdown.Item>
                <NavDropdown.Item
                  as="button"
                  onClick={() => {
                    if (organization?.name) {
                      navigate(`/${organization.name}/users`);
                    }
                  }}
                >
                  Org Users
                </NavDropdown.Item>
                {UserPermission.isRootUser(user.role) && (<NavDropdown.Item
                  as="button"
                  onClick={() => {
                    if (organization?.name) {
                      navigate(`/${organization.name}/organizations`);
                    }
                  }}
                >
                  Organizations
                </NavDropdown.Item>)}
                <NavDropdown.Divider />
                <NavDropdown.Item href="#" onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
        {organization && user && (<>
          <UserProfile
            show={showProfile}
            onHide={handleHideProfile}
            user={user ?? { firstName: '', lastName: '' }}
            onUpdate={props.onProfileUpdate}
          />
          <OrganizationProfile
            show={showOrgModal}
            onHide={handleHideOrgModal}
            organization={organization!}
            userRole={user?.role}
            onUpdate={props.onOrganizationUpdate}
          />
        </>)}
      </Container>
    </Navbar>
  );
};

export default AppNavBar;
