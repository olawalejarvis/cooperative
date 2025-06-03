import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Register from '../components/Register';
import { useOrganizationStore } from '../store/organization';

export default function OrganizationRegisterPage() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const registerUser = useOrganizationStore((state) => state.registerUser);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle registration form submit
  const handleRegister = async (formData: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => {
    setRegisterError(null);
    setRegisterSuccess(false);
    setLoading(true);
    try {
      await registerUser({ ...formData, orgName: organizationName });
      setRegisterSuccess(true);
      // Optionally redirect to login after a short delay
      setTimeout(() => {
        navigate(`/${organizationName}/login`);
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRegisterError(err.message || 'Registration failed');
      } else if (typeof err === 'object' && err && 'response' in err) {
        // Type assertion to access err.response
        setRegisterError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Registration failed');
      } else {
        setRegisterError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showLogin && organizationName) {
      navigate(`/${organizationName}/login`);
    }
  }, [showLogin, organizationName, navigate]);

  return (
    <>
      <div className="d-flex flex-column align-items-center mt-5">
        <h2>Register for {organizationName}</h2>
        <Register
          orgName={organizationName}
          onSubmit={handleRegister}
          error={registerError}
          success={registerSuccess}
          loading={loading}
        />
        {registerSuccess && (
          <div className="alert alert-success mt-3" role="alert">
            User account creation request has been sent. Please wait for an approval email from your organization admin before logging in.
          </div>
        )}
        <div className="mt-3 text-center">
          <button className="btn btn-link" onClick={() => setShowLogin(true)}>
            Already have an account? Login
          </button>
        </div>
      </div>
    </>
  );
}
