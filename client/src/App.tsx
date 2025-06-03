import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthTransactionsContainer } from './pages/TransactionsContainer';
import { AppInitializer } from './AppInitializer';
import OrganizationLoginPage from './pages/OrganizationLoginPage';
import OrganizationRegisterPage from './pages/OrganizationRegisterPage';
import { OrganizationHomeContainer } from './pages/OrganizationHomeContainer';
import OrganizationLayout from './components/OrganizationLayout';
import OrgUsersContainer from './pages/OrgUsersContainer';
import RequireAdmin from './components/RequireAdmin';

function App() {

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInitializer>
          <Routes>
            <Route path="/" element={
              <>
                <h1>Coop App</h1>
                <div>
                  <h1>Welcome to Coop App</h1>
                  <Link to="/root">
                    view default organizations
                  </Link>
                </div>
              </>
            } />
            <Route path="/:organizationName" element={
              <OrganizationLayout>
                <OrganizationHomeContainer />
              </OrganizationLayout>
            } />
            <Route path="/:organizationName/transactions" element={
              <OrganizationLayout>
                <AuthTransactionsContainer />
              </OrganizationLayout>
            } />
            <Route path="/:organizationName/login" element={
              <OrganizationLayout>
                <OrganizationLoginPage />
              </OrganizationLayout>
            } />
            <Route path="/:organizationName/register" element={
              <OrganizationLayout>
                <OrganizationRegisterPage />
              </OrganizationLayout>
            } />
            <Route path="/:organizationName/users" element={
              <OrganizationLayout>
                <RequireAdmin>
                  <OrgUsersContainer />
                </RequireAdmin>
              </OrganizationLayout>
            } />
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
