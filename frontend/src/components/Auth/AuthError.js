import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Container } from '@mui/material';

const AuthError = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const errorMessage = new URLSearchParams(location.search).get('message') || 'Authentication failed';

  return (
    <Container>
      <Alert severity="error">
        {errorMessage}
        <br />
        Redirecting to login...
      </Alert>
    </Container>
  );
};

export default AuthError; 