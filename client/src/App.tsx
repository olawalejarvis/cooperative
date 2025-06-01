import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OrganizationHome } from './pages/OrganizationHome';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {

  return (
    <ErrorBoundary>
      <BrowserRouter>
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
          <Route path="/:organizationName" element={<OrganizationHome />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
