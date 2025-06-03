import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

interface LoginProps {
  orgName?: string;
  error?: string | null;
  loading?: boolean;
  onLogin: (userName: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');


  // Handles the initial login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(userName, password);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
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
    </Container>
  );
};

export default Login;
