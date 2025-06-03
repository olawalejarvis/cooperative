import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserPermission } from '../utils/UserPermission';
import type { Organization } from '../store/organization';
import type { User } from '../store/auth';
import UserProfile from './UserProfile';
import OrganizationProfile from './OrganizationProfile';

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
    <Navbar collapseOnSelect expand="md" bg="dark" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={`/${organization?.name || ''}`}>
          {organization?.label}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {UserPermission.isRootUser(user?.role) && (
              <Nav.Link as={Link} to="/organizations">
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
            )}
            {/* Add more links as needed */}
          </Nav>
          <Nav>
            {user && (
              <NavDropdown
                id="nav-dropdown-dark-example"
                title={`${user.firstName} ${user.lastName}`}
                menuVariant="dark"
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
