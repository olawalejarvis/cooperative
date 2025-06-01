import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import type { User } from '../store/auth';
import { UserPermission } from '../utils/UserPermission';

export interface AppNavBarProps {
  orgName?: string;
  orgLabel?: string;
  orgLogo?: string;
  user?: User | null;
}

const AppNavBar: React.FC<AppNavBarProps> = (props) => {
  const { orgLabel, user, orgName } = props;
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      logout(orgName);
    } catch {
      logout();
    }
  };

  return (
    <Navbar collapseOnSelect expand="md" bg="dark" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          {orgLabel}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {UserPermission.isRootUser(user?.role) && <Nav.Link as={Link} to="/organizations">Organizations</Nav.Link>}
            {UserPermission.isAdmin(user?.role) && <Nav.Link as={Link} to="/users">Users</Nav.Link>}
            {UserPermission.isUser(user?.role) && <Nav.Link as={Link} to="/users">My Transactions</Nav.Link>}
            {/* Add more links as needed */}
          </Nav>
          <Nav>
            {user && (
              <>
                <Nav.Link as={Link} to="#">
                  {user.firstName} {user.lastName}
                </Nav.Link>
                <Nav.Link as={Link} to="#" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavBar;
