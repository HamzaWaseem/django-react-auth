import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      
      if (code) {
        try {
          const response = await authService.googleLogin(code);
          if (response.access_token) {
            localStorage.setItem('user', JSON.stringify(response));
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Google login failed:', error);
          navigate('/login');
        }
      }
    };

    handleCallback();
  }, [location, navigate]);

  return <div>Processing Google login...</div>;
};

export default GoogleCallback;