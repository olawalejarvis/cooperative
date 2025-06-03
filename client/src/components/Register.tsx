import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';

// ...other imports

export interface RegisterProps {
  orgName?: string;
  error?: string | null;
  success?: boolean;
  loading?: boolean;
  onSubmit: (formData: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => Promise<void>;
  // other props...
}

const Register: React.FC<RegisterProps> = ({ onSubmit, error, success, loading }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      userName,
      email,
      password,
      phoneNumber,
    });
    setFirstName('');
    setLastName('');
    setUserName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="userName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
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
            {success && <Alert variant="success">Registration successful! You can now log in.</Alert>}
            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? <Spinner size="sm" animation="border" /> : 'Register'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
