import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    // Google OAuth2 URL construction
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
    const redirectUri = 'http://localhost:3000/google-callback';
    
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    const params = {
      response_type: 'code',
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      prompt: 'select_account',
      access_type: 'offline',
      scope,
    };

    const urlParams = new URLSearchParams(params).toString();
    window.location.href = `${googleAuthUrl}?${urlParams}`;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{ mt: 1, mb: 2 }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLogin;
