import { Container, Spinner, Alert } from 'react-bootstrap';
import AppNavBar from '../components/AppNavBar';
import Login from '../components/Login';
import Register from '../components/Register';
import TransactionTable from '../components/TransactionTable';
import type { Transaction } from '../store/transaction';
import type { UserAggregate } from '../store/user';
import type { SortOrder } from '../types';
import type { Organization } from '../store/organization';
import type { User } from '../store/auth';

function AuthSection({ showRegister, setShowRegister, organizationName }: { showRegister: boolean, setShowRegister: React.Dispatch<React.SetStateAction<boolean>>, organizationName?: string }) {
  return (
    <>
      {showRegister
        ? <Register orgName={organizationName} />
        : <Login orgName={organizationName} />}
      <div className="mt-3 text-center">
        <button
          className="btn btn-link"
          onClick={() => setShowRegister((prev) => !prev)}
        >
          {showRegister ? 'Already have an account? Login' : 'New user? Register'}
        </button>
      </div>
    </>
  );
}

function UserDashboard({ userAggLoading, userAggError, aggregate, transactions, txLoading, txError, sortBy, sortOrder, handleSortChange }: {
  userAggLoading: boolean,
  userAggError: string | null | undefined,
  aggregate: UserAggregate | null,
  transactions: Transaction[],
  txLoading: boolean,
  txError: string | null | undefined,
  sortBy: string,
  sortOrder: SortOrder,
  handleSortChange: (field: string, order: SortOrder) => void
}) {
  return (
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
  );
}

interface OrganizationHomePageProps {
  organization?: Organization | null;
  organizationName?: string;
  loading: boolean;
  error: string | null;
  user?: User | null;
  authLoading: boolean;
  showRegister: boolean;
  setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;
  aggregate: UserAggregate | null;
  userAggLoading: boolean;
  userAggError: string | null | undefined;
  transactions: Transaction[];
  txLoading: boolean;
  txError: string | null | undefined;
  sortBy: string;
  sortOrder: SortOrder;
  handleSortChange: (field: string, order: SortOrder) => void;
  onLogout: () => void;
  onProfileUpdate: (firstName: string, lastName: string) => Promise<void>;
  onOrganizationUpdate: (label: string) => Promise<void>;
}

export default function OrganizationHomePage(props: OrganizationHomePageProps) {
  const {
    organization,
    organizationName,
    loading,
    error,
    user,
    authLoading,
    showRegister,
    setShowRegister,
    aggregate,
    userAggLoading,
    userAggError,
    transactions,
    txLoading,
    txError,
    sortBy,
    sortOrder,
    handleSortChange,
    onLogout,
    onProfileUpdate,
    onOrganizationUpdate,
  } = props;

  if (authLoading || loading) return <Container className="mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!organization) return null;

  return (
    <>
      <AppNavBar
        organization={organization}
        user={user}
        onLogout={onLogout}
        onProfileUpdate={onProfileUpdate}
        onOrganizationUpdate={onOrganizationUpdate}
      />
      <Container className="mt-5">
        <p>{organization.description || 'No description available.'}</p>
        {/* Auth section for login/register */}
        {!user && (
          <AuthSection
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            organizationName={organizationName}
          />
        )}
        {/* User dashboard for logged-in users */}
        {user && (
          <UserDashboard
            userAggLoading={userAggLoading}
            userAggError={userAggError}
            aggregate={aggregate}
            transactions={transactions}
            txLoading={txLoading}
            txError={txError}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
          />
        )}
      </Container>
    </>
  );
}
