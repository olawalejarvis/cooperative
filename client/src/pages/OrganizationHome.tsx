import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationStore } from '../store/organization';
import { useAuthStore } from '../store/auth';
import { useUserStore } from '../store/user';
import { useTransactionStore } from '../store/transaction';
import { Container, Spinner, Alert } from 'react-bootstrap';
import AppNavBar from '../components/AppNavBar';
import Login from '../components/Login';
import Register from '../components/Register';
import TransactionTable from '../components/TransactionTable';
import type { SortOrder } from '../components/TransactionTable';

export function OrganizationHome() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const { organization, loading, error, fetchOrganization } = useOrganizationStore();
  const { user, loading: authLoading, getMe } = useAuthStore();
  const { aggregate, loading: userAggLoading, error: userAggError, fetchUserAggregate } = useUserStore();
  const { transactions, loading: txLoading, error: txError, fetchMyTransactions } = useTransactionStore();
  const [showRegister, setShowRegister] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (organizationName) {
      getMe(organizationName);
      fetchOrganization(organizationName);
    }
  }, [organizationName, fetchOrganization, getMe]);

  useEffect(() => {
    if (user?.id) {
      fetchUserAggregate(user.id)
    }
  }, [user?.id, fetchUserAggregate]);

    useEffect(() => {
    if (user?.id) {
      fetchMyTransactions({ sortBy, sortOrder });
    }
  }, [user?.id, fetchMyTransactions, sortBy, sortOrder]);


  const handleSortChange = (field: string, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };

  if (authLoading || loading) return <Container className="mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!organization) return null;

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
        {user && (
          <div className="mb-3">
            {userAggLoading ? (
              <Spinner animation="border" size="sm" />
            ) : userAggError ? (
              <Alert variant="warning">{userAggError}</Alert>
            ) : aggregate ? (
              <Alert variant="info">
                <strong>Account Balance:</strong> {aggregate.formattedAggregate}
              </Alert>
            ) : null}
            <h5 className="mt-4">My Transactions</h5>
            <TransactionTable
              transactions={transactions}
              loading={txLoading}
              error={txError}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        )}
      </Container>
    </>
  );
}
