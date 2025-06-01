import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuthStore } from '../store/auth';

interface LoginProps {
  orgName?: string;
}

const Login: React.FC<LoginProps> = ({ orgName }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(userName, password, orgName);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid credentials');
      } else if (typeof err === 'object' && err && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } } };
        setError(errorObj.response?.data?.error || 'Invalid credentials');
      } else {
        setError('Invalid credentials');
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <h2 className="mb-4">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="userName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? <Spinner size="sm" animation="border" /> : 'Login'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
