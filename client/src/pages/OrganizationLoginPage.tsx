import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Login from '../components/Login';
import { Verify2FACodeModal } from '../components/Verify2FACodeModal';
import { useAuthStore } from '../store/auth';

export default function OrganizationLoginPage() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const [show2FA, setShow2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ username: string; password: string } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { request2FACode, verify2FACode, user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Post-login redirect
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect, { replace: true });
      } else if (organizationName) {
        navigate(`/${organizationName}`);
      }
    }
  }, [user, searchParams, navigate, organizationName]);

  // Called when Login form is submitted
  const handleLogin = async (username: string, password: string) => {
    setLoginError(null);
    setLoading(true);
    const error = await request2FACode(username, password, organizationName!);
    if (!error) {
      setPendingUser({ username, password });
      setShow2FA(true);
    } else {
      setLoginError(error);
    }
    setLoading(false);
  };

  // Called when 2FA code is submitted
  const handleVerify2FA = async (code: string) => {
    if (!pendingUser) return;
    const error = await verify2FACode(pendingUser.username, code, organizationName!);
    if (!error) {
      setShow2FA(false);
      setPendingUser(null);
      // setUser is called in verify2FACode if successful
    } else {
      setLoginError(error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        padding: '2.5rem 1.5rem',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(80,120,200,0.10)',
        background: '#fff',
        border: '1.5px solid #e0eafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div className="text-center mb-4">
          <h4 style={{ fontWeight: 700, color: '#6366f1', letterSpacing: 1 }}>
            Welcome to {organizationName} Cooperative Society
          </h4>
        </div>
        <p className="text-center text-muted mb-4">
          Please enter your username and password to access your account.
        </p>
        <div className="w-100">
          <Login orgName={organizationName} onLogin={handleLogin} error={loginError} loading={loading} />
        </div>
        <div className="mt-3 text-center">
          <button
            className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
            style={{ fontWeight: 500 }}
            onClick={() => {
              navigate(`/${organizationName}/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
            }}
          >
            New user? Register
          </button>
        </div>
      </div>
      <Verify2FACodeModal
        show={show2FA}
        onHide={() => setShow2FA(false)}
        onSubmit={handleVerify2FA}
        error={loginError}
      />
    </div>
  );
}
