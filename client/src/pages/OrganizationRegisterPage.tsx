import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

export default function OrganizationRegisterPage() {
  const { organizationName } = useParams<{ organizationName: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    // TODO: Replace with actual registration logic
    setTimeout(() => {
      setLoading(false);
      navigate(`/${organizationName}/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    }, 1200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Card style={{ maxWidth: 420, width: '100%', padding: '2rem 1.5rem', borderRadius: 16, boxShadow: '0 4px 24px rgba(80,120,200,0.08)' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h4 style={{ fontWeight: 700, color: '#6366f1', letterSpacing: 1 }}>
              Welcome to {organizationName} Cooperative Society
            </h4>
          </div>
          <h4 className="text-center mb-3" style={{ fontWeight: 700, color: '#3b82f6' }}>
            Registration Request
          </h4>
          <div className="text-muted text-center mb-3" style={{ fontSize: '1.01rem' }}>
            Your registration will be reviewed by an admin before your account is created.
          </div>
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="userName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="username"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                autoComplete="tel"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ minWidth: 0 }}
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button
              variant="primary"
              type="submit"
              className="w-100 rounded-pill fw-semibold"
              style={{ background: '#3b82f6', border: 'none', fontSize: '1.1rem', padding: '0.6rem 0' }}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Button
              variant="outline-primary"
              className="rounded-pill"
              onClick={() => navigate(`/${organizationName}/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}
              style={{ fontWeight: 500 }}
            >
              Already have an account? Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
