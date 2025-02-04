import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const access = params.get('access');
        const refresh = params.get('refresh');

        if (access && refresh) {
          // Create user data object
          const userData = {
            access,
            refresh
          };

          // Store tokens
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update auth context
          if (login) {
            await login(userData);
          }

          // Redirect to home
          navigate('/');
        } else {
          console.error('Missing tokens in URL');
          navigate('/auth/error');
        }
      } catch (error) {
        console.error('Error handling authentication success:', error);
        navigate('/auth/error');
      }
    };

    handleSuccess();
  }, [navigate, location, login]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Processing authentication...</h2>
      <p>Please wait while we complete your sign-in.</p>
    </div>
  );
};

export default AuthSuccess; 