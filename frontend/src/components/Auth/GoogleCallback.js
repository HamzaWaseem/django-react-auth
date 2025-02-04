import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code) {
          // Send the code to your backend
          const response = await fetch('http://localhost:8000/api/auth/google/callback/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          const data = await response.json();
          if (data.access) {
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
          } else {
            navigate('/auth/error/');
          }
        }
      } catch (error) {
        console.error('Google authentication failed:', error);
        navigate('/auth/error/');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing Google Sign In...</div>;
};

export default GoogleCallback; 