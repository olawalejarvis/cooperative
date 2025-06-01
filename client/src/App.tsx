import { useState } from 'react'
import './App.css'
import { useAuthStore } from './store/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OrganizationHome } from './pages/OrganizationHome';

function App() {
  const [count, setCount] = useState(0)
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <h1>Coop App</h1>
            <div className="card">
              <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </button>
            </div>
            <div>
              <h1>Welcome to Zustand + React + TS!</h1>
              {user ? (
                <>
                  <div>Hello, {user.firstName} {user.lastName}</div>
                  <button onClick={logout}>Logout</button>
                </>
              ) : (
                <button onClick={() => setUser({ id: '1', firstName: 'Jane', lastName: 'Doe' })}>
                  Login as Jane Doe
                </button>
              )}
            </div>
          </>
        } />
        <Route path="/:organizationName" element={<OrganizationHome />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
