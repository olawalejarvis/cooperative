import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/auth';
import TwoFactorModal from './TwoFactorModal';

interface LoginProps {
  orgName?: string;
}

const Login: React.FC<LoginProps> = ({ orgName }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<string>('');

  const request2FACode = useAuthStore((state) => state.request2FACode);
  const verify2FACode = useAuthStore((state) => state.verify2FACode);

  // Handles the initial login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTwoFAError(null);
    setShow2FA(false);
    setTwoFALoading(false);
    setPendingUser('');
    const errMsg = await request2FACode(userName, password, orgName!);
    if (!errMsg) {
      setPendingUser(userName);
      setShow2FA(true);
    } else {
      setError(errMsg);
    }
  };

  // Handles the 2FA modal code submission
  const handle2FAVerify = async (code: string) => {
    setTwoFALoading(true);
    setTwoFAError(null);
    const errMsg = await verify2FACode(pendingUser, code, orgName!);
    if (!errMsg) {
      setShow2FA(false);
      // Optionally: redirect or show success here
    } else {
      setTwoFAError(errMsg);
    }
    setTwoFALoading(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <h2 className="mb-4">Login</h2>
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-3" controlId="userName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
      <TwoFactorModal
        show={show2FA}
        onSubmit={handle2FAVerify}
        onHide={() => setShow2FA(false)}
        loading={twoFALoading}
        error={twoFAError}
      />
    </Container>
  );
};

export default Login;
