import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
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
            {UserPermission.isUser(user?.role) && <Nav.Link as={Link} to="/users">Transactions</Nav.Link>}
            {/* Add more links as needed */}
          </Nav>
          <Nav>
            {user && (
              <NavDropdown
                id="nav-dropdown-dark-example"
                title={`${user.firstName} ${user.lastName}`}
                menuVariant="dark"
              >
                <NavDropdown.Item href="#action/3.1">My Profile</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  My Organization
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Setting</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#" onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavBar;
