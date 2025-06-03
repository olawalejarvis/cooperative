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
    <>
      <div className="d-flex flex-column align-items-center mt-5">
        <h2>Login to {organizationName}</h2>
        <Login orgName={organizationName} onLogin={handleLogin} error={loginError} loading={loading} />
        <div className="mt-3 text-center">
          <button
            className="btn btn-link"
            onClick={() => {
              // Redirect to org register page for new user
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
    </>
  );
}
