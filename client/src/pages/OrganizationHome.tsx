import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import { Container, Spinner, Alert } from 'react-bootstrap';
import AppNavBar from '../components/AppNavBar';
import Login from '../components/Login';
import Register from '../components/Register';

export function OrganizationHome() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const { organization, loading, error, fetchOrganization } = useOrganizationStore();
  const { user, loading: authLoading, getMe } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (organizationName) {
      getMe(organizationName);
      fetchOrganization(organizationName);
    }
  }, [organizationName, fetchOrganization, getMe]);

  if (authLoading || loading) return <Container className="mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!organization) return null;


  console.log('OrganizationHome', { organization, user });

  return (
    <>
      <AppNavBar orgLabel={organization.label} user={user}/>
      <Container className="mt-5">
        <p>{organization.description || 'No description available.'}</p>
        {!user && (
          showRegister
            ? <Register orgName={organizationName} />
            : <Login orgName={organizationName} />
        )}
        {!user && (
          <div className="mt-3 text-center">
            <button
              className="btn btn-link"
              onClick={() => setShowRegister((prev) => !prev)}
            >
              {showRegister ? 'Already have an account? Login' : 'New user? Register'}
            </button>
          </div>
        )}
      </Container>
    </>
  );
}
